# Pydantic Chatbot

A full-stack multi-agent chat system with specialized AI agents for Python code generation, web search, and image analysis.

## Project Structure

- `backend/` - FastAPI backend
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

- **Multi-Agent System**: Specialized AI agents for different tasks
  - **Code Expert**: Generates, explains, and executes Python code
  - **Search Expert**: Retrieves and summarizes information from the web
  - **Image Expert**: Analyzes uploaded images with object detection

- **Dual Response Modes**:
  - **Streaming Responses**: Real-time character-by-character display of AI responses
  - **Structured Output**: Comprehensive responses with special formatting for code, search results, and image analysis

- **Interactive UI**:
  - **Right Sidebar**: Displays detailed agent results (code execution, search sources, image analysis)
  - **Left Sidebar**: Session management and chat history
  - **Markdown Support**: Rich text formatting in AI responses

- **Additional Features**:
  - Session management and chat history persistence
  - Image upload and analysis
  - Python code execution with results display
  - Web search with source attribution
  - Mobile-responsive design

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

## Response Modes

### Streaming Mode
In streaming mode, the AI's response appears character-by-character in real-time, creating a more dynamic and interactive experience. This mode is ideal for casual conversations and provides immediate feedback.

### Structured Output Mode
In structured output mode, the system provides a complete, formatted response that separates the main answer from specialized agent outputs:

- **Main Chat Area**: Displays the conversational response
- **Right Sidebar**: Shows detailed structured data:
  - Code blocks with syntax highlighting and execution results
  - Search results with source attribution
  - Image analysis with object detection and scene classification

You can toggle between these modes using the switch in the interface.

## Technology Stack

- **Backend**: FastAPI, Pydantic, SQLite
- **Frontend**: Next.js, TypeScript, Material UI
- **AI**: OpenAI GPT-4o
- **Tooling**: Uvicorn, Logfire
