# Copyright (c) 2023 Lincoln D. Stein and the InvokeAI Development Team

"""
This module fetches model metadata objects from the Civitai model repository.
"""

import json
import re
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse, parse_qs

import requests
from pydantic.networks import AnyHttpUrl
from requests.sessions import Session

from invokeai.backend.model_manager.metadata.fetch.fetch_base import ModelMetadataFetchBase
from invokeai.backend.model_manager.metadata.metadata_base import (
    AnyModelRepoMetadata,
    CivitaiMetadata,
    RemoteModelFile,
    UnknownMetadataException,
)
from invokeai.backend.model_manager.taxonomy import ModelRepoVariant

CIVITAI_MODEL_RE = r"https?://civitai\.[a-z]+/models/(\d+)"
CIVITAI_DOWNLOAD_RE = r"https?://civitai\.[a-z]+/api/download/models/(\d+)"


class CivitaiMetadataFetch(ModelMetadataFetchBase):
    """Fetch model metadata from Civitai."""

    def __init__(self, session: Optional[Session] = None):
        self._requests = session or requests.Session()

    @classmethod
    def from_json(cls, json_str: str) -> CivitaiMetadata:
        metadata = CivitaiMetadata.model_validate_json(json_str)
        return metadata

    def _fetch_model_info(self, version_id: str, token: Optional[str] = None) -> dict:
        url = f"https://civitai.com/api/v1/model-versions/{version_id}"
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        response = self._requests.get(url, headers=headers)
        if response.status_code == 404:
            raise UnknownMetadataException(f"Civitai model version '{version_id}' not found.")
        response.raise_for_status()
        return response.json()

    def from_id(self, id: str, variant: Optional[ModelRepoVariant] = None, token: Optional[str] = None) -> AnyModelRepoMetadata:
        """Return a CivitaiMetadata object given the model's version_id."""
        try:
            model_info = self._fetch_model_info(id, token)
        except requests.HTTPError as e:
            # If we get a 451 Legal Reasons or other errors, we can't get metadata,
            # but we can still construct a download URL since we have the version ID.
            download_url = f"https://civitai.com/api/download/models/{id}"
            if token:
                download_url = f"{download_url}?token={token}"
            return CivitaiMetadata(
                id=int(id),
                name=f"Civitai Model {id}",
                files=[
                    RemoteModelFile(
                        url=download_url,
                        path=Path(f"{id}.safetensors"),  # Downloader will rename via Content-Disposition
                        size=0,
                    )
                ],
                api_response=None,
            )

        files = []
        
        # Determine the best file (usually the primary file or the safetensors file)
        primary_file = None
        for file in model_info.get("files", []):
            if file.get("primary"):
                primary_file = file
                break
        
        if not primary_file and model_info.get("files"):
            primary_file = model_info["files"][0]

        if primary_file:
            download_url = primary_file.get("downloadUrl")
            name = primary_file.get("name")
            size_kb = primary_file.get("sizeKB", 0)
            size_bytes = int(size_kb * 1024)
            sha256 = primary_file.get("hashes", {}).get("SHA256")
            
            if download_url and name:
                if token:
                    separator = "&" if "?" in download_url else "?"
                    download_url = f"{download_url}{separator}token={token}"
                files.append(
                    RemoteModelFile(
                        url=download_url,
                        path=Path(name),
                        size=size_bytes,
                        sha256=sha256,
                    )
                )

        model_name = model_info.get("model", {}).get("name", "Unknown Model")
        version_name = model_info.get("name", "Unknown Version")
        full_name = f"{model_name} - {version_name}"

        return CivitaiMetadata(
            id=model_info.get("id", 0),
            name=full_name,
            files=files,
            api_response=json.dumps(model_info, default=str),
            model_id=model_info.get("modelId"),
            base_model=model_info.get("baseModel"),
        )

    def from_url(self, url: AnyHttpUrl) -> AnyModelRepoMetadata:
        url_str = str(url)
        
        parsed = urlparse(url_str)
        qs = parse_qs(parsed.query)
        token = qs.get("token", [None])[0]

        # Check if it's a download URL: civitai.com/api/download/models/12345
        if match := re.match(CIVITAI_DOWNLOAD_RE, url_str, re.IGNORECASE):
            version_id = match.group(1)
            return self.from_id(version_id, token=token)
            
        # Check if it's a model page URL: civitai.com/models/12345?modelVersionId=67890
        parsed = urlparse(url_str)
        if match := re.match(r"^/models/(\d+)", parsed.path, re.IGNORECASE):
            # Model ID is match.group(1)
            qs = parse_qs(parsed.query)
            if "modelVersionId" in qs:
                version_id = qs["modelVersionId"][0]
                token = qs.get("token", [None])[0]
                return self.from_id(version_id, token=token)
            else:
                # Need to fetch the model info to get the default version ID
                model_id = match.group(1)
                token = qs.get("token", [None])[0]
                
                model_url = f"https://civitai.com/api/v1/models/{model_id}"
                headers = {}
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                try:
                    resp = self._requests.get(model_url, headers=headers)
                    if resp.status_code == 404:
                        raise UnknownMetadataException(f"Civitai model '{model_id}' not found.")
                    resp.raise_for_status()
                    model_data = resp.json()
                    
                    # Use default version or first version
                    versions = model_data.get("modelVersions", [])
                    if not versions:
                        raise UnknownMetadataException(f"No versions found for Civitai model '{model_id}'.")
                        
                    version_id = str(versions[0]["id"])
                    return self.from_id(version_id, token=token)
                except requests.HTTPError as e:
                    raise UnknownMetadataException(f"Failed to fetch Civitai model versions for '{model_id}': {e}")
                
        raise UnknownMetadataException(f"'{url_str}' does not look like a supported Civitai URL")
