Ollama Models:
- codegemma
- gemma3
- functiongemma
- embeddinggemma
- gemma3n
- gemma4

---

# codegemma

CodeGemma is a collection of powerful, lightweight models that can perform a variety of coding tasks like fill-in-the-middle code completion, code generation, natural language understanding, mathematical reasoning, and instruction following.

Variants:
instruct a 7b instruction-tuned variant for natural language-to-code chat and instruction following
code a 7b pretrained variant that specializes in code completion and generation from code prefixes and/or suffixes
2b a state of the art 2B pretrained variant that provides up to 2x faster code completion

Advantages:
Intelligent code completion and generation: Complete lines, functions, and even generate entire blocks of code, whether you’re working locally or using Google Cloud resources.

Enhanced accuracy: Trained on 500 billion tokens of primarily English language data from web documents, mathematics, and code, CodeGemma models generate code that’s not only more syntactically correct but also semantically meaningful, reducing errors and debugging time.

Multi-language proficiency: Supports Python, JavaScript, Java, Kotlin, C++, C#, Rust, Go, and other languages.

Streamlined workflows: Integrate a CodeGemma model into your development environment to write less boilerplate and focus on interesting and differentiated code that matters, faster.

Fill-in-the-middle
CodeGemma models support fill-in-the-middle (FIM), for use in autocomplete or coding assistant tooling. Below is an example using the Ollama Python library:

response = generate(
  model='codegemma:2b-code',
  prompt=f'<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>',
  options={
    'num_predict': 128,
    'temperature': 0,
    'top_p': 0.9,
    'stop': ['<|file_separator|>'],
  },
)

---

# gemma3

Gemma is a lightweight, family of models from Google built on Gemini technology. The Gemma 3 models are multimodal—processing text and images—and feature a 128K context window with support for over 140 languages. Available in 270M, 1B, 4B, 12B, and 27B parameter sizes, they excel in tasks like question answering, summarization, and reasoning, while their compact design allows deployment on resource-limited devices.

Models
Text
270M parameter model (32k context window)

ollama run gemma3:270m
1B parameter model (32k context window)

ollama run gemma3:1b 
Multimodal (Vision)
4B parameter model (128k context window)

ollama run gemma3:4b
12B parameter model (128k context window)

ollama run gemma3:12b
27B parameter model (128k context window)

ollama run gemma3:27b
Quantization aware trained models (QAT)
The quantization aware trained Gemma 3 models preserves similar quality as half precision models (BF16) while maintaining a lower memory footprint (3x less compared to non-quantized models).

1B parameter model

ollama run gemma3:1b-it-qat
4B parameter model

ollama run gemma3:4b-it-qat
12B parameter model

ollama run gemma3:12b-it-qat
27B parameter model

ollama run gemma3:27b-it-qat

---

# functiongemma

FunctionGemma is a specialized version of Google's Gemma 3 270M model fine-tuned explicitly for function calling.

FunctionGemma
FunctionGemma is a lightweight, open model from Google, built as a foundation for creating your own specialized function calling models. The model is well suited for text-only function calling. The uniquely small size makes it possible to deploy in environments with limited resources such as laptops, desktops or your own cloud infrastructure, democratizing access to state of the art AI models and helping foster innovation for everyone.

FunctionGemma is not intended for use as a direct dialogue model, and is designed to be highly performant after further fine-tuning, as is typical of models this size.

Built on the Gemma 3 270M model and with the same research and technology used to create the Gemini models, FunctionGemma has been trained specifically for function calling. The model has the same architecture as Gemma 3, but uses a different chat format.

Furthermore, akin to the base Gemma 270M, the model has been optimized to be extremely versatile, performant on a variety of hardware in single turn scenarios, but should be finetuned on single turn or multiturn task specific data to achieve best accuracy in specific domains.

Examples
Python
Run the python example with uv run tool.py

# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "ollama",
#     "rich",
# ]
# ///
"""
Single tool, single turn example.
Run with: uv run tool.py
"""

import json

from rich import print

from ollama import chat

model = 'functiongemma'


def get_weather(city: str) -> str:
  """
  Get the current weather for a city.

  Args:
    city: The name of the city

  Returns:
    A string describing the weather
  """
  return json.dumps({'city': city, 'temperature': 22, 'unit': 'celsius', 'condition': 'sunny'})


messages = [{'role': 'user', 'content': 'What is the weather in Paris?'}]
print('Prompt:', messages[0]['content'])

response = chat(model, messages=messages, tools=[get_weather])

if response.message.tool_calls:
  tool = response.message.tool_calls[0]
  print(f'Calling: {tool.function.name}({tool.function.arguments})')

  result = get_weather(**tool.function.arguments)
  print(f'Result: {result}')

  messages.append(response.message)
  messages.append({'role': 'tool', 'content': result})

  final = chat(model, messages=messages)
  print('Response:', final.message.content)
else:
  print('Response:', response.message.content)

---

# embeddinggemma

EmbeddingGemma is a 300M parameter embedding model from Google.

EmbeddingGemma is a 300M parameter, state-of-the-art for its size, open embedding model from Google, built from Gemma 3 (with T5Gemma initialization) and the same research and technology used to create Gemini models. EmbeddingGemma produces vector representations of text, making it well-suited for search and retrieval tasks, including classification, clustering, and semantic similarity search. This model was trained with data in 100+ spoken languages.

The small size and on-device focus makes it possible to deploy in environments with limited resources such as mobile phones, laptops, or desktops, democratizing access to state of the art AI models and helping foster innovation for everyone.

Training Dataset
This model was trained on a dataset of text data that includes a wide variety of sources totaling approximately 320 billion tokens. Here are the key components:

Web Documents: A diverse collection of web text ensures the model is exposed to a broad range of linguistic styles, topics, and vocabulary. The training dataset includes content in over 100 languages.
Code and Technical Documents: Exposing the model to code and technical documentation helps it learn the structure and patterns of programming languages and specialized scientific content, which improves its understanding of code and technical questions.
Synthetic and Task-Specific Data: Synthetically training data helps to teach the model specific skills. This includes curated data for tasks like information retrieval, classification, and sentiment analysis, which helps to fine-tune its performance for common embedding applications.

---

# gemma3n

Gemma 3n models are designed for efficient execution on everyday devices such as laptops, tablets or phones.

Name, Size, Context, Input

gemma3n:latest, 7.5GB, 32K, Text

gemma3n:e2b, 5.6GB, 32K, Text

gemma3n:e4b, 7.5GB, 32K, Text

Gemma 3n models are designed for efficient execution on everyday devices such as laptops, tablets or phones. These models were trained with data in over 140 spoken languages.

Gemma 3n models use selective parameter activation technology to reduce resource requirements. This technique allows the models to operate at an effective size of 2B and 4B parameters, which is lower than the total number of parameters they contain.

Models
Effective 2B
ollama run gemma3n:e2b
Effective 4B
ollama run gemma3n:e4b
Evaluation
Model evaluation metrics and results.

Benchmark Results
These models were evaluated at full precision (float32) against a large collection of different datasets and metrics to cover different aspects of content generation. Evaluation results marked with IT are for instruction-tuned models. Evaluation results marked with PT are for pre-trained models. The models available on Ollama are instruction-tuned models.

Usage and Limitations
These models have certain limitations that users should be aware of.

Intended Usage
Open generative models have a wide range of applications across various industries and domains. The following list of potential uses is not comprehensive. The purpose of this list is to provide contextual information about the possible use-cases that the model creators considered as part of model training and development.

Content Creation and Communication
Text Generation: Generate creative text formats such as poems, scripts, code, marketing copy, and email drafts.
Chatbots and Conversational AI: Power conversational interfaces for customer service, virtual assistants, or interactive applications.
Text Summarization: Generate concise summaries of a text corpus, research papers, or reports.
Image Data Extraction: Extract, interpret, and summarize visual data for text communications.
Audio Data Extraction: Transcribe spoken language, translate speech to text in other languages, and analyze sound-based data.
Research and Education
Natural Language Processing (NLP) and generative model Research: These models can serve as a foundation for researchers to experiment with generative models and NLP techniques, develop algorithms, and contribute to the advancement of the field.
Language Learning Tools: Support interactive language learning experiences, aiding in grammar correction or providing writing practice.
Knowledge Exploration: Assist researchers in exploring large bodies of data by generating summaries or answering questions about specific topics.
Ethics and Safety
Ethics and safety evaluation approach and results.

Evaluation Approach
Our evaluation methods include structured evaluations and internal red-teaming testing of relevant content policies. Red-teaming was conducted by a number of different teams, each with different goals and human evaluation metrics. These models were evaluated against a number of different categories relevant to ethics and safety, including:

Child Safety: Evaluation of text-to-text and image to text prompts covering child safety policies, including child sexual abuse and exploitation.
Content Safety: Evaluation of text-to-text and image to text prompts covering safety policies including, harassment, violence and gore, and hate speech.
Representational Harms: Evaluation of text-to-text and image to text prompts covering safety policies including bias, stereotyping, and harmful associations or inaccuracies.
In addition to development level evaluations, we conduct “assurance evaluations” which are our ‘arms-length’ internal evaluations for responsibility governance decision making. They are conducted separately from the model development team, to inform decision making about release. High level findings are fed back to the model team, but prompt sets are held-out to prevent overfitting and preserve the results’ ability to inform decision making. Notable assurance evaluation results are reported to our Responsibility & Safety Council as part of release review.

Evaluation Results
For all areas of safety testing, we saw safe levels of performance across the categories of child safety, content safety, and representational harms relative to previous Gemma models. All testing was conducted without safety filters to evaluate the model capabilities and behaviors. For text-to-text, image-to-text, and audio-to-text, and across all model sizes, the model produced minimal policy violations, and showed significant improvements over previous Gemma models’ performance with respect to high severity violations. A limitation of our evaluations was they included primarily English language prompts.

---

# gemma4

Gemma 4 models are designed to deliver frontier-level performance at each size. They are well-suited for reasoning, agentic workflows, coding, and multimodal understanding.

Supports:
- vision
- Audio
- Tools

Name, Size, Context, Input
gemma4:latest, 9.6GB, 128K, Text, Image
gemma4:e2b, 7.2GB, 128K, Text, Image
gemma4:e4b, 9.6GB, 128K, Text, Image
gemma4:26b, 18GB, 256K, Text, Image
gemma4:31b, 20GB, 256K, Text, Image

Gemma is a family of open models built by Google DeepMind. Gemma 4 models are multimodal, handling text and image input and generating text output.

Gemma 4 introduces key capability and architectural advancements:

- Reasoning – All models in the family are designed as highly capable reasoners, with configurable thinking modes.
- Extended Multimodalities – Processes Text, Image with variable aspect ratio and resolution support (all models)
- Diverse & Efficient Architectures – Offers Dense and Mixture-of-Experts (MoE) variants of different sizes for scalable deployment.
- Optimized for On-Device – Smaller models are specifically designed for efficient local execution on laptops and mobile devices.
- Increased Context Window – The small models feature a 128K context window, while the medium models support 256K.
- Enhanced Coding & Agentic Capabilities – Achieves notable improvements in coding benchmarks alongside native function-calling support, powering highly capable autonomous agents.
- Native System Prompt Support – Gemma 4 introduces native support for the system role, enabling more structured and controllable conversations.

Models: 
Edge models

The “E” in E2B and E4B stands for “effective” parameters, and are made for edge device deployments.

Effective 2B (E2B)

`ollama run gemma4:e2b`

Effective 4B (E4B)

`ollama run gemma4:e4b`

Workstation models

These models are designed for frontier intelligence locally.

26B (Mixture of Experts model with 4B active parameters)

`ollama run gemma4:26b`

31B (Dense)

`ollama run gemma4:31b`

Benchmark Results
These models were evaluated against a large collection of different datasets and metrics to cover different aspects of text generation. Evaluation results marked in the table are for instruction-tuned models.

	Gemma 4 31B	Gemma 4 26B A4B	Gemma 4 E4B	Gemma 4 E2B	Gemma 3 27B (no think)
MMLU Pro	85.2%	82.6%	69.4%	60.0%	67.6%
AIME 2026 no tools	89.2%	88.3%	42.5%	37.5%	20.8%
LiveCodeBench v6	80.0%	77.1%	52.0%	44.0%	29.1%
Codeforces ELO	2150	1718	940	633	110
GPQA Diamond	84.3%	82.3%	58.6%	43.4%	42.4%
Tau2 (average over 3)	76.9%	68.2%	42.2%	24.5%	16.2%
HLE no tools	19.5%	8.7%	-	-	-
HLE with search	26.5%	17.2%	-	-	-
BigBench Extra Hard	74.4%	64.8%	33.1%	21.9%	19.3%
MMMLU	88.4%	86.3%	76.6%	67.4%	70.7%
Vision					
MMMU Pro	76.9%	73.8%	52.6%	44.2%	49.7%
OmniDocBench 1.5 (average edit distance, lower is better)	0.131	0.149	0.181	0.290	0.365
MATH-Vision	85.6%	82.4%	59.5%	52.4%	46.0%
MedXPertQA MM	61.3%	58.1%	28.7%	23.5%	-
Audio					
CoVoST	-	-	35.54	33.47	-
FLEURS (lower is better)	-	-	0.08	0.09	-
Long Context					
MRCR v2 8 needle 128k (average)	66.4%	44.1%	25.4%	19.1%	13.5%

Model information:
Property,	E2B,	E4B,	31B, Dense
Total Parameters,	2.3B effective (5.1B with embeddings),	4.5B effective (8B with embeddings),	30.7B
Layers,	35,	42,	60
Sliding Window,	512 tokens,	512 tokens,	1024 tokens
Context Length,	128K tokens,	128K tokens,	256K tokens
Vocabulary Size,	262K,	262K,	262K
Supported Modalities,	Text, Image, Audio,	Text, Image, Audio,	Text, Image
Vision Encoder Parameters,	~150M,	~150M,	~550M
Audio Encoder Parameters,	~300M,	~300M,	No Audio

Mixture-of-Experts (MoE) Model
Property,	26B A4B	MoE
Total Parameters,	25.2B
Active Parameters,	3.8B
Layers,	30
Sliding Window,	1024 tokens
Context Length,	256K tokens
Vocabulary Size,	262K
Expert Count,	8 active / 128 total and 1 shared
Supported Modalities,	Text, Image
Vision Encoder Parameters,	~550M

Best Practices
For the best performance, use these configurations and best practices:

1. Sampling Parameters
Use the following standardized sampling configuration across all use cases:

- temperature=1.0
- top_p=0.95
- top_k=64

Best Practices
For the best performance, use these configurations and best practices:

1. Sampling Parameters
Use the following standardized sampling configuration across all use cases:

temperature=1.0
top_p=0.95
top_k=64
2. Thinking Mode Configuration
Note that Ollama already handles the complexities of the chat template for you.

Compared to Gemma 3, the models use standard system, assistant, and user roles. To properly manage the thinking process, use the following control tokens:

- Trigger Thinking: Thinking is enabled by including the <|think|> token at the start of the system prompt. To disable thinking, remove the token.
- Standard Generation: When thinking is enabled, the model will output its internal reasoning followed by the final answer using this structure:
<|channel>thought\n[Internal reasoning]<channel|>
- Disabled Thinking Behavior: For all models except for the E2B and E4B variants, if thinking is disabled, the model will still generate the tags but with an empty thought block:
<|channel>thought\n<channel|>[Final answer]

3. Multi-Turn Conversations

- No Thinking Content in History: In multi-turn conversations, the historical model output should only include the final response. Thoughts from previous model turns must not be added before the next user turn begins.

4. Modality order

- For optimal performance with multimodal inputs, place image and/or audio content before the text in your prompt.

5. Variable Image Resolution
Aside from variable aspect ratios, Gemma 4 supports variable image resolution through a configurable visual token budget, which controls how many tokens are used to represent an image. A higher token budget preserves more visual detail

at the cost of additional compute, while a lower budget enables faster inference for tasks that don’t require fine-grained understanding.

- The supported token budgets are: 70, 140, 280, 560, and 1120.
  - Use lower budgets for classification, captioning, or video understanding, where faster inference and processing many frames outweigh fine-grained detail.
  - Use higher budgets for tasks like OCR, document parsing, or reading small text.

