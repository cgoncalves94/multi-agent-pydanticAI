# Frontend — Multi-Agent Chat System

This is the Next.js frontend for the Pydantic Chatbot multi-agent system. For a project overview and architecture, see the [main README](../README.md).

## Prerequisites
- Node.js 18+
- npm (or yarn/pnpm/bun)

## Environment Variables
Create a `.env.local` file in the `frontend` directory with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Setup & Running

### Using the Makefile (recommended, from project root)
- `make frontend` — Run only the frontend UI
- `make dev` — Run both backend and frontend together

### Manual Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Frontend Features
- Modern chat UI with streaming and structured response modes
- Session management and chat history
- Markdown support in responses
- Image upload and analysis
- Code execution results and web search sources in sidebar
- Mobile-responsive design

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI](https://mui.com/)

For project-wide details, see the [main README](../README.md).
