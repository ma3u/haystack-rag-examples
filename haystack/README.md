# Haystack RAG Pipeline Examples

This repository demonstrates how to build Retrieval Augmented Generation (RAG) pipelines using [Haystack](https://haystack.deepset.ai/). Example scripts show how to fetch, preprocess, embed, and retrieve documents, then use OpenAI to generate answers to user questions based on those documents.

## Table of Contents

- [Quickstart](#quickstart)
- [Official GitHub](#official-github)
- [Contents](#contents)
- [Requirements](#requirements)
- [Deployment Guide](#deployment-guide)
- [firstexample.py](#firstexamplepy)
  - [How it works](#how-it-works-firstexamplepy)
  - [Run](#run-firstexamplepy)
  - [Example Output](#example-output-firstexamplepy)
- [agentRAG.py](#agentragpy)
  - [How it works](#how-it-works-agentragpy)
  - [Run](#run-agentragpy)
  - [Example Output](#example-output-agentragpy)
- [Notes](#notes)
- [Further Information](#further-information)

## Quickstart
For a detailed introduction and step-by-step guide, check out the official Haystack Quickstart:

👉 [Haystack Quickstart Guide](https://haystack.deepset.ai/overview/quick-start)

Official GitHub: [deepset-ai/haystack](https://github.com/deepset-ai/haystack)

## Contents
- `firstexample.py`: Minimal example of a RAG pipeline with Haystack and OpenAI.
- `agentRAG.py`: Example RAG pipeline using embedding-based retrieval.

## Requirements
- Python 3.8+
- [Haystack](https://haystack.deepset.ai/) (`farm-haystack`)
- OpenAI API Key (for LLM generation)
- [python-dotenv](https://pypi.org/project/python-dotenv/)
- [openai](https://pypi.org/project/openai/)

You can install all dependencies with:
```sh
pip install -r requirements.txt
```
## Setup
1. (Recommended) Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```sh
   pip install farm-haystack
   ```
3. Set your OpenAI API key as an environment variable:
   ```sh
   export OPENAI_API_KEY="sk-..."
   ```

## Deployment Guide

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd haystack
   ```
2. **Create and activate a virtual environment (recommended):**
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Configure environment variables:**
   - Copy `.env.example` to `.env` and add your OpenAI API key:
     ```sh
     cp .env.example .env
     # Edit .env and set OPENAI_API_KEY=your-key
     ```
5. **Run the example scripts:**
   ```sh
   python3 firstexample.py
   python3 agentRAG.py
   ```

**Note:** `.env` is excluded from version control for security. Never commit your real API keys.

---

## firstexample.py

### How it works (firstexample.py)
- Fetches a web page using Haystack's LinkContentFetcher.
- Converts HTML to documents, builds a prompt, and sends it to OpenAI for answering a hardcoded question about RAG pipelines.

### Run (firstexample.py)

```sh
python3 firstexample.py
```

### Example Output (firstexample.py)

```
To build a Retrieval Augmented Generation (RAG) pipeline with Haystack, you need the following components:

1. Retriever: This component retrieves relevant documents based on a query.
2. ChatPromptBuilder: This component constructs prompts for the language model using the retrieved documents.
3. Chat Generator (LLM): This component generates an answer based on the prompt created from the retrieved documents.

By connecting these components, you can effectively design and scale your pipeline to answer questions based on various document sources.
```

## agentRAG.py

### How it works (agentRAG.py)
- Downloads a biography of Leonardo da Vinci.
- Processes and splits the text into documents.
- Embeds the documents and stores them in-memory.
- Uses embedding-based retrieval to answer questions about the text using OpenAI.

### Run (agentRAG.py)

```sh
python3 agentRAG.py
```

### Example Output (agentRAG.py)

```
Leonardo da Vinci died at the age of 67.
```

## Notes

**Note:** `.env` is excluded from version control for security. Never commit your real API keys.

## Further Information

For more information, visit the [Haystack documentation](https://haystack.deepset.ai/).
