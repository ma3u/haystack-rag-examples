import os
import urllib.request

from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.components.converters import TextFileToDocument
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.embedders import OpenAIDocumentEmbedder, OpenAITextEmbedder
from haystack.components.writers import DocumentWriter
from haystack.components.builders import ChatPromptBuilder
from haystack.components.generators.chat import OpenAIChatGenerator
# Load environment variables from .env (for OpenAI API key)
from dotenv import load_dotenv
load_dotenv()
from haystack.dataclasses import ChatMessage

# Download the biography of Leonardo da Vinci for document indexing
urllib.request.urlretrieve(
    "https://archive.org/stream/leonardodavinci00brocrich/leonardodavinci00brocrich_djvu.txt",
    "davinci.txt"
)

# Set up in-memory document store
document_store = InMemoryDocumentStore()

# Define pipeline components for document ingestion
text_file_converter = TextFileToDocument()     # Converts text file to Haystack Document
cleaner = DocumentCleaner()                    # Cleans document text
splitter = DocumentSplitter()                  # Splits document into smaller chunks
embedder = OpenAIDocumentEmbedder()            # Embeds document chunks with OpenAI
writer = DocumentWriter(document_store)        # Writes embedded docs to store

# Build indexing pipeline for initial document processing
indexing_pipeline = Pipeline()
indexing_pipeline.add_component("converter", text_file_converter)
indexing_pipeline.add_component("cleaner", cleaner)
indexing_pipeline.add_component("splitter", splitter)
indexing_pipeline.add_component("embedder", embedder)
indexing_pipeline.add_component("writer", writer)

# Connect pipeline steps
indexing_pipeline.connect("converter.documents", "cleaner.documents")
indexing_pipeline.connect("cleaner.documents", "splitter.documents")
indexing_pipeline.connect("splitter.documents", "embedder.documents")
indexing_pipeline.connect("embedder.documents", "writer.documents")

# Run the indexing pipeline to process and store the biography
indexing_pipeline.run(data={"sources": ["davinci.txt"]})

# Set up retrieval and generation components
text_embedder = OpenAITextEmbedder()                  # Embeds the query
retriever = InMemoryEmbeddingRetriever(document_store) # Finds relevant docs
prompt_template = [
    ChatMessage.from_user(
      """
      Given these documents, answer the question.
      Documents:
      {% for doc in documents %}
          {{ doc.content }}
      {% endfor %}
      Question: {{query}}
      Answer:
      """
    )
]
prompt_builder = ChatPromptBuilder(template=prompt_template)
llm = OpenAIChatGenerator()

# Build RAG pipeline for answering questions
rag_pipeline = Pipeline()
rag_pipeline.add_component("text_embedder", text_embedder)
rag_pipeline.add_component("retriever", retriever)
rag_pipeline.add_component("prompt_builder", prompt_builder)
rag_pipeline.add_component("llm", llm)

# Connect RAG pipeline components
rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
rag_pipeline.connect("retriever.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "llm")

# Define the question and run the pipeline
query = "How old was Leonardo when he died?"
result = rag_pipeline.run(data={
    "prompt_builder": {"query": query},
    "text_embedder": {"text": query}
})

# Print the generated answer
print(result["llm"]["replies"][0].text)
