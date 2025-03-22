# Pydantic Chatbot

A multi-agent chat system with specialized AI agents for code generation, web search, and image analysis.

## Project Structure

- `backend/` - FastAPI backend
  - `src/` - Core application code
  - `database/` - SQLite database storage
- `frontend/` - Next.js frontend

## Getting Started

### Backend

```bash
# Change directory to backend
cd backend

# Install dependencies using uv
pip install uv
uv pip install -e .

# Run the server
cd src
uvicorn app:app --reload
```

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application. The backend API runs on [http://localhost:8000](http://localhost:8000).

## Features

- Multi-agent AI system
- Python code generation and execution
- Web search integration
- Image analysis
- Session management
- Modern React frontend
- RESTful API with FastAPI
- Real-time streaming responses

## Environment Setup

Create a `.env` file in the root directory with:

```
OPENAI_API_KEY=your_openai_api_key
LOGFIRE_TOKEN=your_logfire_token_if_using_logfire
```

And a `.env.local` file in the frontend directory with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Technology Stack

- **Backend**: FastAPI, Pydantic, SQLite
- **Frontend**: Next.js, TypeScript, Material UI
- **AI**: OpenAI GPT-4o
- **Tooling**: Uvicorn, Logfire
