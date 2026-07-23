# Ollama

## Thinking

Ollama now has the ability to enable or disable thinking. This gives users the flexibility to choose the model’s thinking behavior for different applications and use cases.

When thinking is enabled, the output will separate the model’s thinking from the model’s output. When thinking is disabled, the model will not think and directly output the content.

Models that support thinking:

DeepSeek R1
Qwen 3
more will be added under thinking models.
Thinking in action
Enable thinking in DeepSeek R1
In the CLI, thinking is enabled by default.

This can be useful in getting the model to think through different viewpoints to arrive at more accurate answer.

Disable thinking in DeepSeek R1
In the CLI, thinking is disabled using /set nothink followed by the prompt.

This is useful in getting answers fast out of the model.

CLI
From the Ollama CLI, thinking can be enabled or disabled:

Enable thinking

 --think
Disable thinking

--think=false
Interactive sessions
When chatting inside an interactive session, thinking can be enabled or disabled:

Enable thinking

/set think
Disable thinking

/set nothink
Scripting
For scripting, a --hidethinking command is available. This helps users who want to use thinking models but simply want to see the answer.

Example:

ollama run deepseek-r1:8b --hidethinking "is 9.9 bigger or 9.11?"
API
Both of Ollama’s generate API (/api/generate) and chat API (/api/chat) have been updated to support thinking.

There is a new think parameter that can be set to true or false for enabling a model’s thinking process. When the think parameter is set to true, the output will separate the model’s thinking from the model’s output. This can help users craft new application experiences like animating the thinking process via a graphical interface, or for NPCs in games to have a thinking bubble before the output. When the think parameter is set to false, the model will not think and directly output the content.

Example using Ollama’s chat API with thinking enabled
curl http://localhost:11434/api/chat -d '{
  "model": "deepseek-r1",
  "messages": [
    {
      "role": "user",
      "content": "how many r in the word strawberry?"
    }
  ],
  "think": true,
  "stream": false
}'

Python library
Please update to the latest Ollama Python library.

pip install ollama
Example of enabling thinking
from ollama import chat

messages = [
  {
    'role': 'user',
    'content': 'What is 10 + 23?',
  },
]

response = chat('deepseek-r1', messages=messages, think=True)

print('Thinking:\n========\n\n' + response.message.thinking)
print('\nResponse:\n========\n\n' + response.message.content)
Please visit the Ollama Python library for more information about its usage. More examples are available.

JavaScript library
Please update to the latest Ollama JavaScript library.

npm i ollama
Example of enabling thinking
import ollama from 'ollama'

async function main() {
  const response = await ollama.chat({
    model: 'deepseek-r1',
    messages: [
      {
        role: 'user',
        content: 'What is 10 + 23',
      },
    ],
    stream: false,
    think: true,
  })

  console.log('Thinking:\n========\n\n' + response.message.thinking)
  console.log('\nResponse:\n========\n\n' + response.message.content + '\n\n')
}

main()
Example of streaming responses with thinking
import ollama from 'ollama'

async function main() {
  const response = await ollama.chat({
    model: 'deepseek-r1',
    messages: [
      {
        role: 'user',
        content: 'What is 10 + 23',
      },
    ],
    stream: true,
    think: true,
  })

  let startedThinking = false
  let finishedThinking = false

  for await (const chunk of response) {
    if (chunk.message.thinking && !startedThinking) {
      startedThinking = true
      process.stdout.write('Thinking:\n========\n\n')
    } else if (chunk.message.content && startedThinking && !finishedThinking) {
      finishedThinking = true
      process.stdout.write('\n\nResponse:\n========\n\n')
    }

    if (chunk.message.thinking) {
      process.stdout.write(chunk.message.thinking)
    } else if (chunk.message.content) {
      process.stdout.write(chunk.message.content)
    }
  }
}

main()

## Streaming responses with tool calling

Ollama now supports streaming responses with tool calling. This enables all chat applications to stream content and also call tools in real time.

Models that support using tools:

Qwen 3
Devstral
Qwen2.5 and Qwen2.5-coder
Llama 3.1
Llama 4
and more tool calling models.

cURL
An example of Ollama using the weather tool to answer the prompt What is the weather today in Toronto?

curl http://localhost:11434/api/chat -d '{
  "model": "qwen3",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather today in Toronto?"
    }
  ],
  "stream": true,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The location to get the weather for, e.g. San Francisco, CA"
            },
            "format": {
              "type": "string",
              "description": "The format to return the weather in, e.g. 'celsius' or 'fahrenheit'",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location", "format"]
        }
      }
    }
  ]
}'

Python
Install the latest version of the Ollama Python library:

pip install -U ollama
An example of Ollama using a mathematical function:

# Define the python function
def add_two_numbers(a: int, b: int) -> int:
  """
  Add two numbers

  Args:
    a (set): The first number as an int
    b (set): The second number as an int

  Returns:
    int: The sum of the two numbers
  """
  return a + b
  
from ollama import chat, ChatResponse 
messages = [{'role': 'user', 'content': 'what is three minus one?'}]

response: ChatResponse = chat(
  model='qwen3',
  messages=messages,
  tools=[add_two_numbers], # Python SDK supports passing tools as functions
  stream=True
)

for chunk in response:
	# Print model content
  print(chunk.message.content, end='', flush=True)
  # Print the tool call
  if chunk.message.tool_calls:
    print(chunk.message.tool_calls)
Output
<think>
Okay, the user is asking ...
</think>

[ToolCall(function=Function(name='add_two_numbers', arguments={'a': 3, 'b': 1}))]

How tool parsing works in Ollama
Background
We’ve built a new parser that focuses on understanding the structure of a tool call rather than simply looking for JSON.

Previously, when tools were passed into the model, the system had to wait until the entire output was generated and then parse it as JSON to determine whether it contained a tool call or normal content. Users had to wait for the complete generation before seeing any streamed token. This approach was reliable against malformed output, but blocked streaming because a tool call might occur at any point in the text.

Ollama supports a wide range of models, some trained with tool-specific tokens and some without. The parsing logic would needs to stream user content while being able to detect, suppress, and parse the tool call tokens.

Incremental Parser
The new parser directly references each model’s template to understand the prefix of the tool call. This is necessary for Ollama to understand and separate the tool calls and content.

When a model is not directly trained on tool usage directly (trained with a prefix/tool token), it may still be able to output valid tool calls based on the sheer amount of knowledge it has. In this case, the parser is able to handle the partial prefixes output by the model and correctly separate tool calls and content.

Some models also elect to output a tool call without a prefix, even though they were trained on using a prefix for calling tools. Empirically, this behavior happens at the start of a model output only. To address this, the parser can fallback to parsing JSON as a tool call when it recognizes the start of a JSON. If the JSON does not match the tool call format for the model, the JSON will be returned.

Accuracy
In some cases, a model will reference the tool call it made previously when the results are passed into the model. Previously, this would return in multiple extra tool calls. By implementing prefix matching and correctly managing states where JSON is parsed to detect tool calls, tool calling reliability should be improved.

Previously, a model output like the example below would result in two tool calls instead of one:

[TOOL_CALL] [{"name":"get_conditions","arguments":{"city":"Sydney"}}]
 To get the current weather conditions for Sydney, we can use the function `get_conditions`. 
 However, I don't have real-time data access. Let's assume that the API will return the information:

 [{"name":"get_conditions","arguments":{"city":"Sydney"}}]
Model Context Protocol (MCP)
With the improvements, developers can now stream chat content and tool calls when using Ollama with MCP (Model Context Protocol). Anecdotally, using a context window of 32k or higher improves the performance of tool calling and also the result of the tool call.

Example increasing the context window in Ollama to use 32k
Please note, memory usage increases with a longer context window.

cURL
curl -X POST "http://localhost:11434/api/chat" -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "why is the sky blue?"
    }
  ],
  "options": {
    "num_ctx": 32000 # Update context window here
  }
}'


## ollama-python
link: https://github.com/ollama/ollama-python

Ollama Python Library
The Ollama Python library provides the easiest way to integrate Python 3.8+ projects with Ollama.

Prerequisites
Ollama should be installed and running
Pull a model to use with the library: ollama pull <model> e.g. ollama pull gemma3
See Ollama.com for more information on the models available.
Install
pip install ollama
Usage
from ollama import chat
from ollama import ChatResponse

response: ChatResponse = chat(model='gemma3', messages=[
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
])
print(response['message']['content'])
# or access fields directly from the response object
print(response.message.content)
See _types.py for more information on the response types.

Streaming responses
Response streaming can be enabled by setting stream=True.

from ollama import chat

stream = chat(
    model='gemma3',
    messages=[{'role': 'user', 'content': 'Why is the sky blue?'}],
    stream=True,
)

for chunk in stream:
  print(chunk['message']['content'], end='', flush=True)
Cloud Models
Run larger models by offloading to Ollama’s cloud while keeping your local workflow.

Supported models: deepseek-v3.1:671b-cloud, gpt-oss:20b-cloud, gpt-oss:120b-cloud, kimi-k2:1t-cloud, qwen3-coder:480b-cloud, kimi-k2-thinking See Ollama Models - Cloud for more information
Run via local Ollama
Sign in (one-time):
ollama signin
Pull a cloud model:
ollama pull gpt-oss:120b-cloud
Make a request:
from ollama import Client

client = Client()

messages = [
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
]

for part in client.chat('gpt-oss:120b-cloud', messages=messages, stream=True):
  print(part.message.content, end='', flush=True)
Cloud API (ollama.com)
Access cloud models directly by pointing the client at https://ollama.com.

Create an API key from ollama.com , then set:
export OLLAMA_API_KEY=your_api_key
(Optional) List models available via the API:
curl https://ollama.com/api/tags
Generate a response via the cloud API:
import os
from ollama import Client

client = Client(
    host='https://ollama.com',
    headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
)

messages = [
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
]

for part in client.chat('gpt-oss:120b', messages=messages, stream=True):
  print(part.message.content, end='', flush=True)
Custom client
A custom client can be created by instantiating Client or AsyncClient from ollama.

All extra keyword arguments are passed into the httpx.Client.

from ollama import Client
client = Client(
  host='http://localhost:11434',
  headers={'x-some-header': 'some-value'}
)
response = client.chat(model='gemma3', messages=[
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
])
Async client
The AsyncClient class is used to make asynchronous requests. It can be configured with the same fields as the Client class.

import asyncio
from ollama import AsyncClient

async def chat():
  message = {'role': 'user', 'content': 'Why is the sky blue?'}
  response = await AsyncClient().chat(model='gemma3', messages=[message])

asyncio.run(chat())
Setting stream=True modifies functions to return a Python asynchronous generator:

import asyncio
from ollama import AsyncClient

async def chat():
  message = {'role': 'user', 'content': 'Why is the sky blue?'}
  async for part in await AsyncClient().chat(model='gemma3', messages=[message], stream=True):
    print(part['message']['content'], end='', flush=True)

asyncio.run(chat())
API
The Ollama Python library's API is designed around the Ollama REST API

Chat
ollama.chat(model='gemma3', messages=[{'role': 'user', 'content': 'Why is the sky blue?'}])
Generate
ollama.generate(model='gemma3', prompt='Why is the sky blue?')
List
ollama.list()
Show
ollama.show('gemma3')
Create
ollama.create(model='example', from_='gemma3', system="You are Mario from Super Mario Bros.")
Copy
ollama.copy('gemma3', 'user/gemma3')
Delete
ollama.delete('gemma3')
Pull
ollama.pull('gemma3')
Push
ollama.push('user/gemma3')
Embed
ollama.embed(model='gemma3', input='The sky is blue because of rayleigh scattering')
Embed (batch)
ollama.embed(model='gemma3', input=['The sky is blue because of rayleigh scattering', 'Grass is green because of chlorophyll'])
Ps
ollama.ps()
Errors
Errors are raised if requests return an error status or if an error is detected while streaming.

model = 'does-not-yet-exist'

try:
  ollama.chat(model)
except ollama.ResponseError as e:
  print('Error:', e.error)
  if e.status_code == 404:
    ollama.pull(model)


### Examples

Link: https://github.com/ollama/ollama-python/tree/main/examples

Running Examples
Run the examples in this directory with:

# Run example
python3 examples/<example>.py

# or with uv
uv run examples/<example>.py
See ollama/docs/api.md for full API documentation

Chat - Chat with a model
chat.py
async-chat.py
chat-stream.py - Streamed outputs
chat-with-history.py - Chat with model and maintain history of the conversation
Generate - Generate text with a model
generate.py
async-generate.py
generate-stream.py - Streamed outputs
fill-in-middle.py - Given a prefix and suffix, fill in the middle
Tools/Function Calling - Call a function with a model
tools.py - Simple example of Tools/Function Calling
async-tools.py
multi-tool.py - Using multiple tools, with thinking enabled
gpt-oss
gpt-oss-tools.py
gpt-oss-tools-stream.py
Web search
An API key from Ollama's cloud service is required. You can create one here.

export OLLAMA_API_KEY="your_api_key_here"
web-search.py
web-search-gpt-oss.py - Using browser research tools with gpt-oss
MCP server
The MCP server can be used with an MCP client like Cursor, Cline, Codex, Open WebUI, Goose, and more.

uv run examples/web-search-mcp.py
Configuration to use with an MCP client:

{
  "mcpServers": {
    "web_search": {
      "type": "stdio",
      "command": "uv",
      "args": ["run", "path/to/ollama-python/examples/web-search-mcp.py"],
      "env": { "OLLAMA_API_KEY": "your_api_key_here" }
    }
  }
}
web-search-mcp.py
Multimodal with Images - Chat with a multimodal (image chat) model
multimodal-chat.py
multimodal-generate.py
Structured Outputs - Generate structured outputs with a model
structured-outputs.py
async-structured-outputs.py
structured-outputs-image.py
Ollama List - List all downloaded models and their properties
list.py
Ollama Show - Display model properties and capabilities
show.py
Ollama ps - Show model status with CPU/GPU usage
ps.py
Ollama Pull - Pull a model from Ollama
Requirement: pip install tqdm

pull.py
Ollama Create - Create a model from a Modelfile
create.py
Ollama Embed - Generate embeddings with a model
embed.py
Thinking - Enable thinking mode for a model
thinking.py
Thinking (generate) - Enable thinking mode for a model
thinking-generate.py
Thinking (levels) - Choose the thinking level
thinking-levels.py

# New model scheduling

Ollama now includes a significantly improved model scheduling system. Ahead of running a model, Ollama’s new engine will now measure the exact amount of memory required compared to an estimation in previous versions of Ollama. This has several benefits:

Significantly reduced crashes due to out of memory issues: Because memory management is exact, over-allocations no longer occur meaning fewer out of memory issues.
Maximizing GPU utilization: Ollama’s new memory management allocates more memory to the GPU, increasing token generation and processing speeds
Multi-GPU performance: Ollama will now schedule models more efficiently over multiple GPUs, significantly improving multi-GPU and mismatched GPU performance
Accurate reporting: Measurements in tools like nvidia-smi will now match ollama ps making it easy to track memory utilization on your system
All models implemented in Ollama’s new engine now have this new feature enabled by default, with more models coming soon as they transition to Ollama’s new engine.

Examples
Long context
GPU: 1x NVIDIA GeForce RTX 4090
Model: gemma3:12b
Context length: 128k
Old	New
52.02 tokens/s token generation speed	85.54 tokens/s token generation speed
19.9GiB of VRAM	21.4GiB of VRAM
48⁄49 layers loaded on GPU	49⁄49 layers loaded on GPU
Image input
GPU: 2x NVIDIA GeForce RTX 4090
Model: mistral-small3.2
Context length: 32k
Old	New
127.84 tokens/s prompt evaluation speed	1380.24 tokens/s prompt evaluation speed
43.15 tokens/s token generation speed	55.61 tokens/s token generation speed
19.9GiB of VRAM	21.4GiB of VRAM
40⁄41 layers loaded on GPU	41⁄41 layers loaded on GPU + vision model
Supported models
All models implemented in Ollama’s new engine use the new memory management features:

gpt-oss
llama4, llama3.2-vision (soon: llama3.2, llama3.1, llama3)
gemma3, embeddinggemma, gemma3n
qwen3, qwen2.5vl (soon: qwen3-coder)
mistral-small3.2
all-minilm and other embedding models

# Ollama's new engine for multimodal models

Ollama now supports multimodal models via Ollama’s new engine, starting with new vision multimodal models:

Meta Llama 4
Google Gemma 3
Qwen 2.5 VL
Mistral Small 3.1
and more vision models.
General Multimodal Understanding & Reasoning
Llama 4 Scout
ollama run llama4:scout
(Note: this is a 109 billion parameter, mixture-of-experts model.)

Example of asking location-based questions about a video frame:

You can then ask follow-up questions:

ollama@ollamas-computer ~ % ollama run llama4:scout
>>> what do you see in this image?  /Users/ollama/Downloads/multimodal-example1.png 
Added image '/Users/ollama/Downloads/multimodal-example1.png'
The image depicts a scenic waterfront area with a prominent clock tower at its center. The clock tower, likely the Ferry Building Clock Tower in San Francisco, features a tall structure with a clock face on each side and an American flag flying atop. 

In the foreground, there are several buildings, including what appears to be a marketplace or shopping center, with a parking lot and a street lined with cars. The background showcases a large body of water, possibly a bay or harbor, with a bridge visible in the distance. The sky above is blue with white clouds, suggesting a daytime setting with pleasant weather conditions.

Overall, the image presents a picturesque view of a waterfront area, highlighting the iconic clock tower and the surrounding architecture, as well as the natural beauty of the bay and sky.

>>> how far is this building from the stanford campus in palo alto? 
The distance between the Ferry Building in San Francisco and the Stanford University campus in Palo Alto is approximately 35 miles (56 kilometers). The drive typically takes around 45-60 minutes, depending on traffic conditions.

>>> what's the best way to get there? 
The best way to get to Stanford University from the Ferry Building in San Francisco depends on your preferences and budget. Here are a few options:

1. **By Car**: Take US-101 South to CA-85 South, then continue on CA-101 South. The journey takes around 45-60 minutes, depending on traffic.

2. **By Train and Shuttle**: Take Caltrain from the San Francisco Station (4th and King Streets) to the Palo Alto Station. From there, you can take the Stanford University shuttle (Red and White) to campus. The total travel time is around 1 hour and 15 minutes.

3. **By Ride-hailing Services**: Uber or Lyft from San Francisco to Stanford University takes around 45-60 minutes, depending on traffic.

Please check for any service disruptions or schedule changes before your trip.
Gemma 3
ollama run gemma3
Example of giving multiple images and asking about their relations:

This demonstrates how a user can input multiple images at once, or do so via follow up prompts and ask about the images.

ollama@ollamas-computer ~ % ollama run gemma3
>>> /Users/ollama/Downloads/img1.png /Users/ollama/Downloads/img2.png /Users/ollama/Downloads/img3.png /Users/
... ollama/Downloads/img4.png tell me what animal appears in all 4 images? 

Added image '/Users/ollama/Downloads/img1.png'
Added image '/Users/ollama/Downloads/img2.png'
Added image '/Users/ollama/Downloads/img3.png'
Added image '/Users/ollama/Downloads/img4.png'

The animal featured in all four images is a **llama**.

>>> is there a marine mammal in one of the images? 
Yes! You are absolutely right to spot that. 

In the first image, there’s a **dolphin** (whale) boxing with the llama.

>>> in the boxing image, is the llama more likely to win or the whale? 

That’s a fantastic question! Given the image, the llama is *much* more likely to win. 

Here’s why:

*   **Punching Power:** The llama is clearly throwing a punch with a closed fist, demonstrating intent and force.

*   **Whale’s Reaction:** The whale is clearly recoiling in pain and fear.

It's a comical mismatch, but the llama has the upper hand in this boxing match!
Document scanning
Qwen 2.5 VL
ollama run qwen2.5vl
Example of using Qwen 2.5 VL for character recognition:

Example understanding and translating vertical Chinese spring couplets to English:

Ollama’s new multimodal engine

Ollama has so far relied on the ggml-org/llama.cpp project for model support and has instead focused on ease of use and model portability.

As more multimodal models are released by major research labs, the task of supporting these models the way Ollama intends became more and more challenging.

We set out to support a new engine that makes multimodal models first-class citizens, and getting Ollama’s partners to contribute more directly to the community via the GGML tensor library.

What does this mean?

To sum it up, this work is to improve the reliability and accuracy of Ollama’s local inference, and to set the foundations for supporting future modalities with more capabilities - i.e. speech, image generation, video generation, longer context sizes, improved tool support for models.

Let’s break down a couple specific areas:

Model modularity
Our goal is to confine each model’s “blast radius” to itself, thereby improving reliability and simplifying model integration for the model creators and developers.

Today, ggml/llama.cpp offers first-class support for text-only models. For multimodal systems, however, the text decoder and vision encoder are split into separate models and executed independently. Passing image embeddings from the vision model into the text model therefore demands model-specific logic in the orchestration layer that can break specific model implementations.

Within Ollama, each model is fully self-contained and can expose its own projection layer, aligned with how that model was trained. This isolation lets model creators implement and ship their code without patching multiple files or adding cascading if statements. They no longer need to understand a shared multimodal projection function or worry about breaking other models—they can focus solely on their own model and its training.

Examples of how some models are implemented are available on Ollama’s GitHub repository.

Accuracy
Large images produce large number of tokens which may exceed the batch size. Processing this correctly with the right positional information is challenging, specifically when a single image crosses boundaries.

Ollama adds metadata as it processes images to help improve accuracy.

Some examples:

Should causal attention be on / off?

Is it possible to split the image embeddings into batches for processing, and if possible, what are the boundaries when accounting for quality of output, and the computer being used for inference? If an image is split in the wrong place, the quality of output goes down. This is usually defined by the model, and can be checked in its paper.

Many other local inference tools implement this differently; while a similar result may be achieved, it does not follow how the models were designed and trained.

Memory management
Image caching

Once an image is processed, Ollama caches it so later prompts are faster. The image remains in cache while it is still being used and is not discarded for memory-cleanup limits.

Memory estimation & KV cache optimizations

Ollama collaborates with hardware manufacturers and an operating system partner to make sure the correct hardware metadata is detected to better estimate and optimize for memory usage. For many firmware releases, partners will validate/test it against Ollama to minimize regression and to benchmark against new features.

Ollama has some KV cache optimizations to improve how memory can be efficiently used. Ollama configures causal attention at the individual model level instead of configuring as a group.

Examples:

Google DeepMind’s Gemma 3 leverages sliding window attention, and Ollama can leverage that to allocate a subset or a portion of the model’s context length to improve performance, and because of the resulting memory efficiency, we can increase the context length of the model on the same system or use the remaining memory for higher concurrency.

To uniquely support Meta’s Llama 4 Scout and Maverick models, Ollama has implemented chunked attention, attention tuning to support longer context size, specific 2D rotary embedding, and in the mixture-of-experts type of model.

If a model’s attention layer isn’t fully implemented, such as sliding window attention or chunked attention, it may still ‘work’. However, because this isn’t how the model was trained, the end user may begin to see erratic or degraded output by the model itself over time. This becomes especially prominent the longer the context / sequence due to cascading effects.

# Structured outputs

Ollama now supports structured outputs making it possible to constrain a model’s output to a specific format defined by a JSON schema. The Ollama Python and JavaScript libraries have been updated to support structured outputs.

Use cases for structured outputs include:

Parsing data from documents
Extracting data from images
Structuring all language model responses
More reliability and consistency than JSON mode
Get started
Download the latest version of Ollama

Upgrade to the latest version of the Ollama Python or JavaScript library:

Python

pip install -U ollama
JavaScript

npm i ollama
To pass structured outputs to the model, the format parameter can be used in the cURL request or the format parameter in the Python or JavaScript libraries.

cURL
curl -X POST http://localhost:11434/api/chat -H "Content-Type: application/json" -d '{
  "model": "llama3.1",
  "messages": [{"role": "user", "content": "Tell me about Canada."}],
  "stream": false,
  "format": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "capital": {
        "type": "string"
      },
      "languages": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "name",
      "capital", 
      "languages"
    ]
  }
}'
Output
The response is returned in the format defined by the JSON schema in the request.

{
  "capital": "Ottawa",
  "languages": [
    "English",
    "French"
  ],
  "name": "Canada"
}
Python
Using the Ollama Python library, pass in the schema as a JSON object to the format parameter as either dict or use Pydantic (recommended) to serialize the schema using model_json_schema().

from ollama import chat
from pydantic import BaseModel

class Country(BaseModel):
  name: str
  capital: str
  languages: list[str]

response = chat(
  messages=[
    {
      'role': 'user',
      'content': 'Tell me about Canada.',
    }
  ],
  model='llama3.1',
  format=Country.model_json_schema(),
)

country = Country.model_validate_json(response.message.content)
print(country)
Output
name='Canada' capital='Ottawa' languages=['English', 'French']

Examples
Data extraction
To extract structured data from text, define a schema to represent information. The model then extracts the information and returns the data in the defined schema as JSON:

from ollama import chat
from pydantic import BaseModel

class Pet(BaseModel):
  name: str
  animal: str
  age: int
  color: str | None
  favorite_toy: str | None

class PetList(BaseModel):
  pets: list[Pet]

response = chat(
  messages=[
    {
      'role': 'user',
      'content': '''
        I have two pets.
        A cat named Luna who is 5 years old and loves playing with yarn. She has grey fur.
        I also have a 2 year old black cat named Loki who loves tennis balls.
      ''',
    }
  ],
  model='llama3.1',
  format=PetList.model_json_schema(),
)

pets = PetList.model_validate_json(response.message.content)
print(pets)

Example output
pets=[
  Pet(name='Luna', animal='cat', age=5, color='grey', favorite_toy='yarn'), 
  Pet(name='Loki', animal='cat', age=2, color='black', favorite_toy='tennis balls')
]
Image description
Structured outputs can also be used with vision models. For example, the following code uses llama3.2-vision to describe the following image and returns a structured output:

from ollama import chat
from pydantic import BaseModel

class Object(BaseModel):
  name: str
  confidence: float
  attributes: str 

class ImageDescription(BaseModel):
  summary: str
  objects: List[Object]
  scene: str
  colors: List[str]
  time_of_day: Literal['Morning', 'Afternoon', 'Evening', 'Night']
  setting: Literal['Indoor', 'Outdoor', 'Unknown']
  text_content: Optional[str] = None

path = 'path/to/image.jpg'

response = chat(
  model='llama3.2-vision',
  format=ImageDescription.model_json_schema(),  # Pass in the schema for the response
  messages=[
    {
      'role': 'user',
      'content': 'Analyze this image and describe what you see, including any objects, the scene, colors and any text you can detect.',
      'images': [path],
    },
  ],
  options={'temperature': 0},  # Set temperature to 0 for more deterministic output
)

image_description = ImageDescription.model_validate_json(response.message.content)
print(image_description)
Example output
summary='A palm tree on a sandy beach with blue water and sky.' 
objects=[
  Object(name='tree', confidence=0.9, attributes='palm tree'), 
  Object(name='beach', confidence=1.0, attributes='sand')
], 
scene='beach', 
colors=['blue', 'green', 'white'], 
time_of_day='Afternoon' 
setting='Outdoor' 
text_content=None
OpenAI compatibility
from openai import OpenAI
import openai
from pydantic import BaseModel

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

class Pet(BaseModel):
    name: str
    animal: str
    age: int
    color: str | None
    favorite_toy: str | None

class PetList(BaseModel):
    pets: list[Pet]

try:
    completion = client.beta.chat.completions.parse(
        temperature=0,
        model="llama3.1:8b",
        messages=[
            {"role": "user", "content": '''
                I have two pets.
                A cat named Luna who is 5 years old and loves playing with yarn. She has grey fur.
                I also have a 2 year old black cat named Loki who loves tennis balls.
            '''}
        ],
        response_format=PetList,
    )

    pet_response = completion.choices[0].message
    if pet_response.parsed:
        print(pet_response.parsed)
    elif pet_response.refusal:
        print(pet_response.refusal)
except Exception as e:
    if type(e) == openai.LengthFinishReasonError:
        print("Too many tokens: ", e)
        pass
    else:
        print(e)
        pass
Tips
For reliable use of structured outputs, consider to:

Use Pydantic (Python) or Zod (JavaScript) to define the schema for the response
Add “return as JSON” to the prompt to help the model understand the request
Set the temperature to 0 for more deterministic output

# Ollama Python library 0.4 with function calling improvements

In the latest version of the Ollama Python library, functions can now be provided as tools. The library now also has full typing support and new examples have been added.

Get started
Start by installing or upgrading the Ollama Python library:

pip install -U ollama
Passing Python functions as tools
Define a Python function
Start by defining a regular Python function. For better results, annotate parameter and return values types and optionally add a Google-style docstring:

def add_two_numbers(a: int, b: int) -> int:
  """
  Add two numbers

  Args:
    a: The first integer number
    b: The second integer number

  Returns:
    int: The sum of the two numbers
  """
  return a + b
Pass the function as a tool to Ollama
Next, use the tools field to pass the function as a tool to Ollama:

import ollama

response = ollama.chat(
  'llama3.1',
  messages=[{'role': 'user', 'content': 'What is 10 + 10?'}],
  tools=[add_two_numbers], # Actual function reference
)
Call the function from the model response
Use the returned tool call and arguments provided by the model to call the respective function:

available_functions = {
  'add_two_numbers': add_two_numbers,
}

for tool in response.message.tool_calls or []:
  function_to_call = available_functions.get(tool.function.name)
  if function_to_call:
    print('Function output:', function_to_call(**tool.function.arguments))
  else:
    print('Function not found:', tool.function.name)
Pass existing functions as tools
Functions from existing Python libraries, SDKs, and elsewhere can now also be provided as tools. For example, the following code passes the request function from the requests library as a tool to fetch the contents of the Ollama website:

import ollama
import requests

available_functions = {
  'request': requests.request,
}

response = ollama.chat(
  'llama3.1',
  messages=[{
    'role': 'user',
    'content': 'get the ollama.com webpage?',
  }],
  tools=[requests.request], 
)

for tool in response.message.tool_calls or []:
  function_to_call = available_functions.get(tool.function.name)
  if function_to_call == requests.request:
    # Make an HTTP request to the URL specified in the tool call
    resp = function_to_call(
      method=tool.function.arguments.get('method'),
      url=tool.function.arguments.get('url'),
    )
    print(resp.text)
  else:
    print('Function not found:', tool.function.name)

How it works: generating JSON Schema from functions
The Ollama Python library uses Pydantic and docstring parsing to generate the JSON schema. As an example, for the add_two_nubmers function declared at the start of this post, the following JSON schema is generated (and was previously required to be provided manually as a tool):

{
    "type": "function",
    "function": {
        "name": "add_two_numbers",
        "description": "Add two numbers",
        "parameters": {
            "type": "object",
            "required": [
                "a",
                "b"
            ],
            "properties": {
                "a": {
                    "type": "integer",
                    "description": "The first integer number"
                },
                "b": {
                    "type": "integer",
                    "description": "The second integer number"
                }
            }
        }
    }
}
Additional improvements to the Ollama Python library
The 0.4 release of the Ollama Python library includes additional improvements:

Examples have been updated on the Ollama Python GitHub.
Full typing support throughout the library to support direct object access while maintaining existing functionality.

# Tool support

Ollama now supports tool calling with popular models such as Llama 3.1. This enables a model to answer a given prompt using tool(s) it knows about, making it possible for models to perform more complex tasks or interact with the outside world.

Example tools include:

Functions and APIs
Web browsing
Code interpreter
much more!

Tool calling
To enable tool calling, provide a list of available tools via the tools field in Ollama’s API.

import ollama

response = ollama.chat(
    model='llama3.1',
    messages=[{'role': 'user', 'content':
        'What is the weather in Toronto?'}],

		# provide a weather checking tool to the model
    tools=[{
      'type': 'function',
      'function': {
        'name': 'get_current_weather',
        'description': 'Get the current weather for a city',
        'parameters': {
          'type': 'object',
          'properties': {
            'city': {
              'type': 'string',
              'description': 'The name of the city',
            },
          },
          'required': ['city'],
        },
      },
    },
  ],
)

print(response['message']['tool_calls'])
Supported models will now answer with a tool_calls response. Tool responses can be provided via messages with the tool role. See API documentation for more information.

Supported models
A list of supported models can be found under the Tools category on the models page:

Llama 3.1
Mistral Nemo
Firefunction v2
Command-R +
Note: please check if you have the latest model by running ollama pull <model>

OpenAI compatibility
Ollama’s OpenAI compatible endpoint also now supports tools, making it possible to switch to using Llama 3.1 and other models.

import openai

openai.base_url = "http://localhost:11434/v1"
openai.api_key = 'ollama'

response = openai.chat.completions.create(
	model="llama3.1",
	messages=messages,
	tools=tools,
)
Examples
Python
JavaScript
Future improvements
Streaming tool calls: stream tool calls back to begin taking action faster when multiple tools are returned
Tool choice: force a model to use a tool

# An entirely open-source AI code assistant inside your editor

Continue enables you to easily create your own coding assistant directly inside Visual Studio Code and JetBrains with open-source LLMs. All this can run entirely on your own laptop or have Ollama deployed on a server to remotely power code completion and chat experiences based on your needs.

To get set up, you’ll want to install

Continue for VS Code or JetBrains
Ollama for macOS, Linux, or Windows
Once you have them downloaded, here’s what we recommend exploring:

Try out Mistral AI’s Codestral 22B model for autocomplete and chat
As of the now, Codestral is our current favorite model capable of both autocomplete and chat. This model demonstrates how LLMs have improved for programming tasks. However, with 22B parameters and a non-production license, it requires quite a bit of VRAM and can only be used for research and testing purposes, so it might not be the best fit for daily local usage.

a. Download and run Codestral in your terminal by running

ollama run codestral
b. Click on the gear icon in the bottom right corner of Continue to open your config.json and add

{
  "models": [
    {
      "title": "Codestral",
      "provider": "ollama",
      "model": "codestral"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "ollama",
    "model": "codestral"
  }
}

Use DeepSeek Coder 6.7B for autocomplete and Llama 3 8B for chat
Depending on how much VRAM you have on your machine, you might be able to take advantage of Ollama’s ability to run multiple models and handle multiple concurrent requests by using DeepSeek Coder 6.7B for autocomplete and Llama 3 8B for chat. If your machine can’t handle both at the same time, then try each of them and decide whether you prefer a local autocomplete or a local chat experience. You can then use a remotely hosted or SaaS model for the other experience.

a. Download and run DeepSeek Coder 6.7B in your terminal by running

ollama run deepseek-coder:6.7b-base
b. Download and run Llama 3 8B in another terminal window by running

ollama run llama3:8b
c. Click on the gear icon in the bottom right corner of Continue to open your config.json and add

{
  "models": [
    {
      "title": "Llama 3 8B",
      "provider": "ollama",
      "model": "llama3:8b"
    }
  ],
  "tabAutocompleteModel": {
    "title": "DeepSeek Coder 6.7B",
    "provider": "ollama",
    "model": "deepseek-coder:6.7b-base"
  }
}
Use nomic-embed-text embeddings with Ollama to power @codebase
Continue comes with an @codebase context provider built-in, which lets you automatically retrieve the most relevant snippets from your codebase. Assuming you have a chat model set up already (e.g. Codestral, Llama 3), you can keep this entire experience local thanks to embeddings with Ollama and LanceDB. As of now, we recommend using nomic-embed-text embeddings.

a. Download nomic-embed-text in your terminal by running

ollama pull nomic-embed-text
b. Click on the gear icon on the bottom right corner of Continue to open your config.json and add

{
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text"
  }
}
c. Depending on the size of your codebase, it might take some time to index and then you can ask it questions with important codebase sections automatically being found and used in the answer (e.g. “@codebase what is the default context length for Llama 3?”)

Fine-tune StarCoder 2 on your development data and push it to the Ollama model library
When you use Continue, you automatically generate data on how you build software. By default, this development data is saved to .continue/dev_data on your local machine. When combined with the code that you ultimately commit, it can be used to improve the LLM that you or your team use (if you allow). For example, you can use accepted autocomplete suggestions from your team to fine-tune a model like StarCoder 2 to give you better suggestions.

a. Extract and load the “accepted tab suggestions” into Hugging Face Datasets

b. Use Hugging Face Supervised Fine-tuning Trainer to fine-tune StarCoder 2

c. Push the model to the Ollama model library for your team to use and measure how your acceptance rate changes

Learn more about Ollama by using @docs to ask questions with the help of Continue
Continue also comes with an @docs context provider built-in, which lets you index and retrieve snippets from any documentation site. Assuming you have a chat model set up already (e.g. Codestral, Llama 3), you can keep this entire experience local by providing a link to the Ollama README on GitHub and asking questions to learn more with it as context.

a. Type @docs in the chat sidebar, select “Add Docs”, copy and paste “https://github.com/ollama/ollama” into the URL field, and type “Ollama” into the title field

b. It should quickly index the Ollama README and then you can ask it questions with important sections automatically being found and used in the answer (e.g. “@Ollama how do I run Llama 3?”)

# Embedding models

Ollama supports embedding models, making it possible to build retrieval augmented generation (RAG) applications that combine text prompts with existing documents or other data.

What are embedding models?
Embedding models are models that are trained specifically to generate vector embeddings: long arrays of numbers that represent semantic meaning for a given sequence of text:

The resulting vector embedding arrays can then be stored in a database, which will compare them as a way to search for data that is similar in meaning.

Example embedding models
Model	Parameter Size	
mxbai-embed-large	334M	View model
nomic-embed-text	137M	View model
all-minilm	23M	View model
Usage
To generate vector embeddings, first pull a model:

ollama pull mxbai-embed-large
Next, use the REST API, Python or JavaScript libraries to generate vector embeddings from the model:

REST API

curl http://localhost:11434/api/embed -d '{
  "model": "mxbai-embed-large",
  "input": "Llamas are members of the camelid family"
}'
Python library

ollama.embed(
  model='mxbai-embed-large',
  input='Llamas are members of the camelid family',
)
Javascript library

ollama.embed({
    model: 'mxbai-embed-large',
    input: 'Llamas are members of the camelid family',
})
Ollama also integrates with popular tooling to support embeddings workflows such as LangChain and LlamaIndex.

Example
This example walks through building a retrieval augmented generation (RAG) application using Ollama and embedding models.

Step 1: Generate embeddings
pip install ollama chromadb
Create a file named example.py with the contents:

import ollama
import chromadb

documents = [
  "Llamas are members of the camelid family meaning they're pretty closely related to vicuñas and camels",
  "Llamas were first domesticated and used as pack animals 4,000 to 5,000 years ago in the Peruvian highlands",
  "Llamas can grow as much as 6 feet tall though the average llama between 5 feet 6 inches and 5 feet 9 inches tall",
  "Llamas weigh between 280 and 450 pounds and can carry 25 to 30 percent of their body weight",
  "Llamas are vegetarians and have very efficient digestive systems",
  "Llamas live to be about 20 years old, though some only live for 15 years and others live to be 30 years old",
]

client = chromadb.Client()
collection = client.create_collection(name="docs")

# store each document in a vector embedding database
for i, d in enumerate(documents):
  response = ollama.embed(model="mxbai-embed-large", input=d)
  embeddings = response["embeddings"]
  collection.add(
    ids=[str(i)],
    embeddings=embeddings,
    documents=[d]
  )
Step 2: Retrieve
Next, add the code to retrieve the most relevant document given an example prompt:

# an example input
input = "What animals are llamas related to?"

# generate an embedding for the input and retrieve the most relevant doc
response = ollama.embed(
  model="mxbai-embed-large",
  input=prompt
)
results = collection.query(
  query_embeddings=[response["embeddings"]],
  n_results=1
)
data = results['documents'][0][0]
Step 3: Generate
Lastly, use the prompt and the document retrieved in the previous step to generate an answer!

# generate a response combining the prompt and data we retrieved in step 2
output = ollama.generate(
  model="llama2",
  prompt=f"Using this data: {data}. Respond to this prompt: {input}"
)

print(output['response'])
Then, run the code:

python example.py
Llama 2 will answer the prompt What animals are llamas related to? using the data:

Llamas are members of the camelid family, which means they are closely related to two other animals: vicuñas and camels. All three species belong to the same evolutionary lineage and share many similarities in terms of their physical characteristics, behavior, and genetic makeup. Specifically, llamas are most closely related to vicuñas, with which they share a common ancestor that lived around 20-30 million years ago. Both llamas and vicuñas are members of the family Camelidae, while camels belong to a different family (Dromedary).
Coming soon
More features are coming to support workflows that involve embeddings:

Batch embeddings: processing multiple input data prompts simultaneously
OpenAI API Compatibility: support for the /v1/embeddings OpenAI-compatible endpoint
More embedding model architectures: support for ColBERT, RoBERTa, and other embedding model architectures

# How to prompt Code Llama

Two weeks ago the Code Llama model was released by Meta with three variations:

Instruct
Code completion
Python
This guide walks through the different ways to structure prompts for Code Llama for its different variations and features.

Examples below use the 7 billion parameter model with 4-bit quantization, but 13 billion and 34 billion parameter models were made available as well. This guide uses the open-source Ollama project to download and prompt Code Llama, but these prompts will work in other model providers and runtimes too.

Instruct
The instruct model was trained to output human-like answers to questions. This model variation is the easiest to use and will behave closest to ChatGPT, with answer questions including both natural language and code:

Prompt

ollama run codellama:7b-instruct 'You are an expert programmer that writes simple, concise code and explanations. Write a python function to generate the nth fibonacci number.'
Response

Here is a Python function that generates the nth Fibonacci number:

def fib(n):
    if n <= 1:
        return n
    else:
        return fib(n-1) + fib(n-2)

This function uses the recursive formula for the Fibonacci sequence, which is:

fib(n) = fib(n-1) + fib(n-2)
Code Review
Code reviews can often be time consuming for teams. Code Llama can help by providing a second set of eyes on a commit or pull request for simple bugs:

Prompt

ollama run codellama '
Where is the bug in this code?

def fib(n):
    if n <= 0:
        return n
    else:
        return fib(n-1) + fib(n-2)
'
Response

The bug in this code is that it does not handle the case where `n` is equal to 1.
Unit Tests
Writing unit tests often requires quite a bit of boilerplate code. Code Llama can help:

Prompt

ollama run codellama "write a unit test for this function: $(cat fib.py)"
Response

Here's an example of how you could write a unit test for the `fib` function:

```
import unittest

class TestFib(unittest.TestCase):
    def test_fib(self):
        self.assertEqual(fib(0), 0)
        self.assertEqual(fib(1), 1)
        self.assertEqual(fib(2), 1)
        self.assertEqual(fib(3), 2)
        self.assertEqual(fib(4), 3)
        self.assertEqual(fib(5), 5)
        self.assertEqual(fib(6), 8)
        self.assertEqual(fib(7), 13)
        self.assertEqual(fib(8), 21)
        self.assertEqual(fib(9), 34)
if __name__ == '__main__':
    unittest.main()
```

This test case covers all the cases where the input is an integer between 0 and 9, inclusive.
Code completion
The standard code completion model will simply continue to generate subsequent tokens based on the provided prompt. This variation works best if you’re only looking to generate code, such as having the model write a function after seeing the function signature or comment:

Prompt

ollama run codellama:7b-code '# A simple python function to remove whitespace from a string:'
Response

def remove_whitespace(s):
    return ''.join(s.split())
Infill
Fill-in-the-middle (FIM), or more briefly, infill is a special prompt format supported by the code completion model can complete code between two already written code blocks. This is especially effective for inserting code within an existing function such as below:

def compute_gcd(x, y):

    <FILL>

    return result
With Code Llama, infill prompts require a special format that the model expects.

<PRE> {prefix} <SUF>{suffix} <MID>
To use this with existing code, split the code before and after in the example above the into parts: the prefix, and the suffix. For example, for our LCM example above:

Prompt

ollama run codellama:7b-code '<PRE> def compute_gcd(x, y): <SUF>return result <MID>'
While results will vary, you should get something like this:

Response

  if x == y:
        return x

    if x > y:
        x = x - y
    else:
        y = y - x

    result = compute_gcd(x, y)
Note: the model may return <EOT> at the end of the result. This is a special token in the response that represents the end of the response similar to <PRE>, <SUF> and <MID>

Python
As a thank you to the community and tooling that created the model, the authors of Code Llama included a Python variation which is fine-tuned on 100B additional Python tokens, making it a good model to use when working on machine learning-related tooling, or any other Python code:

Prompt

ollama run codellama:7b-python '
# django view for rendering the current day and time without a template
def current_datetime(request):'
Response

    now = datetime.now()
    html = "<html><body>It is now %s.</body></html>" % now
    return HttpResponse(html)
Tools built on Code Llama
Cody has an experimental version that uses Code Llama with infill support.
Continue supports Code Llama as a drop-in replacement for GPT-4
Fine-tuned versions of Code Llama from the Phind and WizardLM teams
Open interpreter can use Code Llama to generate functions that are then run locally in the terminal


