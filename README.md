# Pydantic Chatbot

A full-stack multi-agent chat system with specialized AI agents for Python code generation, web search, and image analysis.

## Features

- **Multi-Agent System**: Specialized AI agents for different tasks
  - **Code Expert**: Generates, explains, and executes Python code
  - **Search Expert**: Retrieves and summarizes information from the web
  - **Image Expert**: Analyzes uploaded images with object detection
- **Dual Response Modes**: Streaming and structured output
- **Interactive UI**: Session management, chat history, markdown support
- **Additional**: Image upload, Python code execution, web search with source attribution, mobile-responsive design

## Architecture

- `backend/` — FastAPI backend (see [backend/README.md](backend/README.md) for setup)
- `frontend/` — Next.js frontend (see [frontend/README.md](frontend/README.md) for setup)

## Unified Development with Makefile

Use the Makefile for easy development:

- `make dev` — Run both backend and frontend (recommended for local development)
- `make backend` — Run only the backend API
- `make frontend` — Run only the frontend UI

## Environment Variables

Create a `.env` file in the project root with:

```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
LOGFIRE_TOKEN=your_logfire_token_if_using_logfire
```

And a `.env.local` file in the frontend directory with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Technology Stack

- **Backend**: FastAPI, Pydantic, SQLite
- **Frontend**: Next.js, TypeScript, Material UI
- **AI**: OpenAI GPT-4o, Google Gemini 2.5 Flash
- **Tooling**: Uvicorn, Logfire

## More Information

- For backend setup, API docs, and advanced usage, see [backend/README.md](backend/README.md)
- For frontend setup and development, see [frontend/README.md](frontend/README.md)
