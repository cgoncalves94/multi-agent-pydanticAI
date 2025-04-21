# Multi-Agent Chat System Backend

This is a [FastAPI](https://fastapi.tiangolo.com/) project that powers the multi-agent chat system with specialized AI agents for code generation, web search, and image analysis.

## Getting Started

You can run the backend using the Makefile from the project root:

- `make backend` — Run only the backend API

Or follow the manual steps below:

First, install the Python dependencies using uv:

```bash
# Change directory to backend
cd backend

# Install uv if not already installed
pip install uv

# Install dependencies from pyproject.toml
uv pip install -e .
```

Then, run the development server:

```bash
cd src
uvicorn app:app --reload
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser to see the automatically generated API documentation.

## Project Structure

- `src/` - Core application code
  - `app.py` - FastAPI application and API endpoints
  - `agents.py` - Multi-agent system implementation
  - `database.py` - SQLite database connection and operations
- `database/` - SQLite database storage
- `uploads/` - Directory for storing uploaded images

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
LOGFIRE_TOKEN=your_logfire_token_if_using_logfire
```

## Features

- Multi-agent system with specialized AI agents
- Code generation and execution
- Web search integration
- Image analysis
- Streaming responses
- Session management
- SQLite database for persistence

## Learn More

To learn more about the technologies used in this project:

- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features
- [Pydantic Documentation](https://docs.pydantic.dev/) - data validation and settings management
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference) - learn about OpenAI API
- [SQLite Documentation](https://www.sqlite.org/docs.html) - learn about SQLite

## Tools and Libraries

- FastAPI - Web framework
- Pydantic - Data validation
- OpenAI - AI models
- Google Gemini - AI models
- SQLite - Database
- Logfire - Logging (optional)
- Uvicorn - ASGI server
