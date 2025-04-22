# Backend — Multi-Agent Chat System

This is the FastAPI backend for the Pydantic Chatbot multi-agent system. For a project overview and architecture, see the [main README](../README.md).

## Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended for fast dependency management)

## Environment Variables
Create a `.env` file in the backend directory or project root with:
```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
LOGFIRE_TOKEN=your_logfire_token_if_using_logfire
```

## Setup & Running

### Using the Makefile (recommended, from project root)
- `make backend` — Run only the backend API
- `make dev` — Run both backend and frontend together

### Manual Setup

1. **Change to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install UV package manager:**
   ```bash
   # Unix/macOS
   curl -LsSf https://astral.sh/uv/install.sh | sh
   # Windows (PowerShell)
   irm https://astral.sh/uv/install.ps1 | iex
   ```

3. **Create and activate a virtual environment:**
   ```bash
   uv venv .venv --python=3.11

   # Activate virtual environment
   source .venv/bin/activate  # Unix/macOS
   .venv\Scripts\activate     # Windows
   ```

4. **Install dependencies:**
   ```bash
   uv pip install -e .
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

6. **Run the development server:**
   ```bash
   cd src
   uvicorn app:app --reload
   ```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for the API documentation.

## Project Structure
- `src/` — Core application code
  - `app.py` — FastAPI application and API endpoints
  - `agents.py` — Multi-agent system implementation
  - `database.py` — SQLite database connection and operations
- `database/` — SQLite database storage
- `uploads/` — Directory for storing uploaded images

## Backend Features
- Multi-agent orchestration (code, search, image analysis)
- Python code execution and explanation
- Web search integration
- Image upload and analysis
- Streaming and structured responses
- Session management
- SQLite persistence
- Integration with MCP servers

## Learn More
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Google Gemini](https://ai.google.dev/gemini-api/docs)

For project-wide details, see the [main README](../README.md).
