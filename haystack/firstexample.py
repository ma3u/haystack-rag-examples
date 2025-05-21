import os

from haystack import Pipeline
from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import HTMLToDocument
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

# Load environment variables from .env file (including OpenAI API key)
from dotenv import load_dotenv
load_dotenv()

# Set up pipeline components:
# - fetcher: downloads web content
# - converter: converts HTML to Haystack Document objects
# - prompt_template: prompt for the LLM to answer a specific question based on docs
fetcher = LinkContentFetcher()
converter = HTMLToDocument()
prompt_template = [
    ChatMessage.from_user(
      """
      According to the contents of this website:
      {% for document in documents %}
        {{document.content}}
      {% endfor %}
      Answer the given question: {{query}}
      Answer:
      """
    )
]

# Build the prompt and LLM generator
prompt_builder = ChatPromptBuilder(template=prompt_template)
llm = OpenAIChatGenerator()

# Assemble the pipeline: fetch, convert, prompt, generate
pipeline = Pipeline()
pipeline.add_component("fetcher", fetcher)
pipeline.add_component("converter", converter)
pipeline.add_component("prompt", prompt_builder)
pipeline.add_component("llm", llm)

# Connect the components in order
pipeline.connect("fetcher.streams", "converter.sources")
pipeline.connect("converter.documents", "prompt.documents")
pipeline.connect("prompt.prompt", "llm")

# Run the pipeline with a specific URL and question about RAG pipelines
result = pipeline.run({
    "fetcher": {"urls": ["https://haystack.deepset.ai/overview/quick-start"]},
    "prompt": {"query": "Which components do I need for a RAG pipeline?"}
})

# Print the LLM's answer
print(result["llm"]["replies"][0].text)
