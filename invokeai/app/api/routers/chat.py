import base64
from io import BytesIO
from typing import List, Optional
from PIL import Image

from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import StreamingResponse
import json
from pydantic import BaseModel
import ollama
from invokeai.app.api.dependencies import ApiDependencies

chat_router = APIRouter(prefix="/v1/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str
    images: Optional[List[str]] = None

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: Optional[bool] = False
    keep_alive: Optional[int] = None
    tools: Optional[List[dict]] = None

@chat_router.get("/models", operation_id="list_chat_models")
async def list_chat_models():
    """List available Ollama models"""
    try:
        async with ollama.AsyncClient() as client:
            response = await client.list()
            return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.post("/generate", operation_id="chat_generate")
async def chat_generate(request: ChatRequest = Body(...)):
    """Generate a chat response using Ollama"""
    try:
        messages_payload = []
        for m in request.messages:
            msg_dict = {"role": m.role, "content": m.content}
            if m.images:
                encoded_images = []
                for img_name in m.images:
                    # Get absolute path
                    img_path = ApiDependencies.invoker.services.images.get_path(img_name)
                    
                    # Extract prompt metadata if available
                    metadata = ApiDependencies.invoker.services.images.get_metadata(img_name)
                    if metadata and hasattr(metadata, "root") and isinstance(metadata.root, dict):
                        prompt = metadata.root.get("positive_prompt")
                        neg_prompt = metadata.root.get("negative_prompt")
                        seed = metadata.root.get("seed")
                        steps = metadata.root.get("steps")
                        cfg_scale = metadata.root.get("cfg_scale")
                        width = metadata.root.get("width")
                        height = metadata.root.get("height")
                        scheduler = metadata.root.get("scheduler")
                        
                        meta_str = []
                        if prompt:
                            meta_str.append(f"Prompt: '{prompt}'")
                        if neg_prompt:
                            meta_str.append(f"Negative Prompt: '{neg_prompt}'")
                        if seed:
                            meta_str.append(f"Seed: {seed}")
                        if steps:
                            meta_str.append(f"Steps: {steps}")
                        if cfg_scale:
                            meta_str.append(f"CFG Scale: {cfg_scale}")
                        if width and height:
                            meta_str.append(f"Dimensions: {width}x{height}")
                        if scheduler:
                            meta_str.append(f"Scheduler: {scheduler}")
                            
                        if meta_str:
                            msg_dict["content"] += "\n\n[System Context: The attached image was generated with the following settings:\n- " + "\n- ".join(meta_str) + "]"

                    # Read image and convert to PNG to ensure Ollama compatibility (Ollama vision doesn't support WebP)
                    try:
                        with Image.open(img_path) as img:
                            if img.mode not in ('RGB', 'L'):
                                img = img.convert('RGB')
                            buffer = BytesIO()
                            img.save(buffer, format="PNG")
                            encoded_images.append(base64.b64encode(buffer.getvalue()).decode("utf-8"))
                    except Exception:
                        with open(img_path, "rb") as image_file:
                            encoded_images.append(base64.b64encode(image_file.read()).decode("utf-8"))
                        
                msg_dict["images"] = encoded_images
                print(f"IMAGES PAYLOAD LENGTHS: {[len(img) for img in msg_dict['images']]}")
                print(f"FIRST 100 CHARS: {[img[:100] for img in msg_dict['images']]}")
                
            messages_payload.append(msg_dict)
        
        kwargs = {
            "model": request.model,
            "messages": messages_payload,
            "stream": request.stream,
            "keep_alive": request.keep_alive if request.keep_alive is not None else "5m"
        }
        
        if request.keep_alive is not None:
            kwargs["keep_alive"] = request.keep_alive
            
        if request.tools is not None:
            print(f"TOOLS RECEIVED IN BACKEND: {len(request.tools)}")
            kwargs["tools"] = request.tools

        async with ollama.AsyncClient() as client:
            response = await client.chat(**kwargs)
        
        if request.stream:
            raise HTTPException(status_code=400, detail="Streaming not yet implemented in this endpoint. Set stream=False.")
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.post("/stream", operation_id="chat_stream")
async def chat_stream(request: ChatRequest = Body(...)):
    """Generate a streaming chat response using Ollama"""
    try:
        messages_payload = []
        for m in request.messages:
            msg_dict = {"role": m.role, "content": m.content}
            if m.images:
                encoded_images = []
                for img_name in m.images:
                    img_path = ApiDependencies.invoker.services.images.get_path(img_name)
                    metadata = ApiDependencies.invoker.services.images.get_metadata(img_name)
                    if metadata and hasattr(metadata, "root") and isinstance(metadata.root, dict):
                        prompt = metadata.root.get("positive_prompt")
                        neg_prompt = metadata.root.get("negative_prompt")
                        seed = metadata.root.get("seed")
                        steps = metadata.root.get("steps")
                        cfg_scale = metadata.root.get("cfg_scale")
                        width = metadata.root.get("width")
                        height = metadata.root.get("height")
                        scheduler = metadata.root.get("scheduler")
                        
                        meta_str = []
                        if prompt:
                            meta_str.append(f"Prompt: '{prompt}'")
                        if neg_prompt:
                            meta_str.append(f"Negative Prompt: '{neg_prompt}'")
                        if seed:
                            meta_str.append(f"Seed: {seed}")
                        if steps:
                            meta_str.append(f"Steps: {steps}")
                        if cfg_scale:
                            meta_str.append(f"CFG Scale: {cfg_scale}")
                        if width and height:
                            meta_str.append(f"Dimensions: {width}x{height}")
                        if scheduler:
                            meta_str.append(f"Scheduler: {scheduler}")
                            
                        if meta_str:
                            msg_dict["content"] += "\n\n[System Context: The attached image was generated with the following settings:\n- " + "\n- ".join(meta_str) + "]"

                    try:
                        with Image.open(img_path) as img:
                            if img.mode not in ('RGB', 'L'):
                                img = img.convert('RGB')
                            buffer = BytesIO()
                            img.save(buffer, format="PNG")
                            encoded_images.append(base64.b64encode(buffer.getvalue()).decode("utf-8"))
                    except Exception:
                        with open(img_path, "rb") as image_file:
                            encoded_images.append(base64.b64encode(image_file.read()).decode("utf-8"))
                        
                msg_dict["images"] = encoded_images
                
            messages_payload.append(msg_dict)
        
        kwargs = {
            "model": request.model,
            "messages": messages_payload,
            "stream": True,
            "keep_alive": request.keep_alive if request.keep_alive is not None else "5m"
        }
        
        if request.tools is not None:
            kwargs["tools"] = request.tools

        async def generate():
            async with ollama.AsyncClient() as client:
                response = await client.chat(**kwargs)
                async for chunk in response:
                    yield f"data: {chunk.model_dump_json()}\n\n"
                
        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
