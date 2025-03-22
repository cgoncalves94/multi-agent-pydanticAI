"""
FastAPI application for the multi-agent chat system.

This module provides the web server and API endpoints for the multi-agent chat system.
"""

import json
import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from pydantic_ai.messages import ModelMessagesTypeAdapter

from database import Database, get_database
from agents import process_query, process_query_stream

import logfire

logfire.configure(scrubbing=False)
logfire.instrument_pydantic_ai()


# ===================================================
# Data Models
# ===================================================
class ChatMessage(BaseModel):
    """Chat message model for API requests and responses."""

    role: str = Field(description="Role of the message sender (user or model)")
    content: str = Field(description="Content of the message")
    timestamp: Optional[str] = Field(description="Timestamp of the message")
    metadata: Optional[Dict[str, Any]] = Field(
        description="Metadata from agent results (code, search_results, image_analysis)",
        default_factory=dict,
    )


class ChatRequest(BaseModel):
    """Request model for chat API."""

    session_id: Optional[str] = Field(
        description="Session ID (if continuing a conversation)"
    )
    message: str = Field(description="User message")
    image_url: Optional[str] = Field(description="URL of an image to analyze")
    username: Optional[str] = Field(
        description="Username for the session", default="User"
    )


class SessionInfo(BaseModel):
    """Session information model."""

    id: str = Field(description="Session ID")
    username: str = Field(description="Username for the session")
    created_at: str = Field(description="Session creation timestamp")
    last_used: str = Field(description="Session last used timestamp")


class NewSessionRequest(BaseModel):
    """Request model for creating a new session."""

    username: str = Field(description="Username for the new session")


# ===================================================
# FastAPI Application Setup
# ===================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for the FastAPI application.

    This sets up and tears down resources for the application.
    """
    # Initialize database connection
    await get_database()

    # Create the uploads directory at startup if it doesn't exist
    uploads_dir = Path(__file__).parent.parent.parent / "uploads"
    os.makedirs(uploads_dir, exist_ok=True)

    yield
    # No need to close the database as it's a singleton


app = FastAPI(
    title="Multi-Agent Chat System",
    description="A web interface for the multi-agent system with specialized agents for code, search, and image analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================================================
# Helper Functions
# ===================================================
def format_message_for_frontend(msg, raw_msg) -> ChatMessage:
    """Format a ModelMessage for frontend use."""
    if msg.kind == "request":
        for part in msg.parts:
            if part.part_kind == "user-prompt":
                return ChatMessage(
                    role="user",
                    content=part.content,
                    timestamp=msg.timestamp.isoformat()
                    if hasattr(msg, "timestamp")
                    else datetime.now().isoformat(),
                    metadata={},
                )
    elif msg.kind == "response":
        for part in msg.parts:
            if part.part_kind == "text":
                # Get metadata from raw JSON
                metadata = {}
                for raw_part in raw_msg.get("parts", []):
                    if raw_part.get("part_kind") == "text" and "attributes" in raw_part:
                        metadata = raw_part["attributes"]
                        break

                return ChatMessage(
                    role="model",
                    content=part.content,
                    timestamp=msg.timestamp.isoformat()
                    if hasattr(msg, "timestamp")
                    else datetime.now().isoformat(),
                    metadata=metadata or {},
                )
    return None


# ===================================================
# API Routes
# ===================================================
@app.get("/api/sessions", response_model=List[SessionInfo])
async def get_sessions(db: Database = Depends(get_database)):
    """Get all sessions."""
    sessions = await db.list_sessions()
    return sessions


@app.post("/api/sessions", response_model=SessionInfo)
async def create_session(
    request: NewSessionRequest, db: Database = Depends(get_database)
):
    """Create a new session."""
    session_id = f"session-{uuid.uuid4()}"
    await db.add_session(session_id, request.username)

    # Set some default preferences
    await db.set_preference(session_id, "style", "detailed")

    return {
        "id": session_id,
        "username": request.username,
        "created_at": datetime.now().isoformat(),
        "last_used": datetime.now().isoformat(),
    }


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, db: Database = Depends(get_database)):
    """Delete a session."""
    await db.delete_session(session_id)
    return {"status": "deleted"}


@app.get("/api/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_session_messages(session_id: str, db: Database = Depends(get_database)):
    """Get all messages for a session."""
    # Get raw message data
    raw_message_jsons = await db.get_raw_message_json(session_id)
    messages = []

    for raw_json in raw_message_jsons:
        # Extract data from the raw JSON
        raw_messages_json = raw_json.decode("utf-8")
        raw_messages = json.loads(raw_messages_json)

        # Deserialize with Pydantic for proper typing
        pydantic_messages = ModelMessagesTypeAdapter.validate_json(raw_json)

        # Process each message in this batch
        for i, msg in enumerate(pydantic_messages):
            if i >= len(raw_messages):
                continue  # Safety check

            formatted_msg = format_message_for_frontend(msg, raw_messages[i])
            if formatted_msg:
                messages.append(formatted_msg)

    return messages


@app.post("/api/sessions/{session_id}/clear")
async def clear_session_messages(session_id: str, db: Database = Depends(get_database)):
    """Clear all messages for a session."""
    await db.clear_session(session_id)
    return {"status": "cleared"}


@app.post("/api/chat", response_model=Dict[str, Any])
async def chat(request: ChatRequest, db: Database = Depends(get_database)):
    """Send a chat message and get a structured response."""
    # Create a new session if none is provided
    session_id = request.session_id
    if not session_id:
        session_id = f"session-{uuid.uuid4()}"
        await db.add_session(session_id, request.username or "User")
        await db.set_preference(session_id, "style", "detailed")
    else:
        await db.update_session_last_used(session_id)

    # Get preferences and session info
    preferences = await db.get_preferences(session_id)
    sessions = await db.list_sessions()
    session = next((s for s in sessions if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get message history
    message_history = await db.get_messages(session_id)

    # Save user message first
    user_message_dict = {
        "kind": "request",
        "parts": [{"part_kind": "user-prompt", "content": request.message}],
        "timestamp": datetime.now().isoformat(),
    }
    await db.add_messages(session_id, json.dumps([user_message_dict]).encode())

    # Process the query with main_agent (structured output)
    result = await process_query(
        prompt=request.message,
        session_id=session_id,
        username=session["username"],  # Use username from the session
        preferences=preferences,
        message_history=message_history,
        current_image_path=request.image_url,
    )

    # Save model response with metadata
    metadata = {}
    if result["result"].code_result:
        metadata["code_result"] = result["result"].code_result.dict()
    if result["result"].search_result:
        metadata["search_result"] = result["result"].search_result.dict()
    if result["result"].image_analysis_result:
        metadata["image_analysis_result"] = result[
            "result"
        ].image_analysis_result.dict()

    # Ensure metadata is properly serializable
    metadata_json = json.dumps(metadata)
    metadata_parsed = json.loads(metadata_json)

    model_message_dict = {
        "kind": "response",
        "parts": [
            {
                "part_kind": "text",
                "content": result["result"].answer,
                "attributes": metadata_parsed,
            }
        ],
        "timestamp": datetime.now().isoformat(),
    }
    await db.add_messages(session_id, json.dumps([model_message_dict]).encode())

    return {
        "session_id": session_id,
        "result": {
            "answer": result["result"].answer,
            "code_result": result["result"].code_result,
            "search_result": result["result"].search_result,
            "image_analysis_result": result["result"].image_analysis_result,
        },
        "usage": result["usage"],
    }


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest, db: Database = Depends(get_database)):
    """Send a chat message and get a streaming response."""
    # Create a new session if none is provided
    session_id = request.session_id
    if not session_id:
        session_id = f"session-{uuid.uuid4()}"
        await db.add_session(session_id, request.username or "User")
        await db.set_preference(session_id, "style", "detailed")
    else:
        await db.update_session_last_used(session_id)

    # Get preferences and session info
    preferences = await db.get_preferences(session_id)
    sessions = await db.list_sessions()
    session = next((s for s in sessions if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get message history
    message_history = await db.get_messages(session_id)

    async def stream_response():
        # Add the user message to the stream first
        user_message = {
            "type": "content",
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
        }

        # Save the user message to the database
        user_message_dict = {
            "kind": "request",
            "parts": [{"part_kind": "user-prompt", "content": request.message}],
            "timestamp": datetime.now().isoformat(),
        }
        await db.add_messages(session_id, json.dumps([user_message_dict]).encode())

        # Send user message to stream
        message_data = json.dumps(user_message)
        yield f"data: {message_data}\n\n"

        final_result = None

        # Process the query with streaming
        async for chunk in process_query_stream(
            prompt=request.message,
            session_id=session_id,
            username=session["username"],
            preferences=preferences,
            message_history=message_history,
            current_image_path=request.image_url,
        ):
            if chunk["done"]:
                # This is the final chunk with the complete result
                final_result = chunk
                continue

            # Stream the text response
            stream_data = {
                "type": "content",
                "role": "model",
                "content": chunk["text"],
                "timestamp": datetime.now().isoformat(),
            }
            message_data = json.dumps(stream_data)
            yield f"data: {message_data}\n\n"

        # After the stream completes, save only the final message
        if final_result:
            # Create metadata with code, search, and image results
            metadata = {}
            if "code_result" in final_result and final_result["code_result"]:
                metadata["code_result"] = final_result["code_result"]
            if "search_result" in final_result and final_result["search_result"]:
                metadata["search_result"] = final_result["search_result"]
            if (
                "image_analysis_result" in final_result
                and final_result["image_analysis_result"]
            ):
                metadata["image_analysis_result"] = final_result[
                    "image_analysis_result"
                ]

            # Ensure metadata is properly serializable
            metadata_json = json.dumps(metadata)
            metadata_parsed = json.loads(metadata_json)

            # Create the final message dictionary
            model_message_dict = {
                "kind": "response",
                "parts": [
                    {
                        "part_kind": "text",
                        "content": final_result["result"],
                        "attributes": metadata_parsed,
                    }
                ],
                "timestamp": datetime.now().isoformat(),
            }

            # Save only the final model response
            await db.add_messages(session_id, json.dumps([model_message_dict]).encode())

            # Send the complete result structure
            final_data = {
                "type": "final",
                "content": final_result["result"],
                "usage": final_result["usage"],
            }
            message_data = json.dumps(final_data)
            yield f"data: {message_data}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@app.post("/api/upload-image", response_model=Dict[str, str])
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file."""
    # Directory to store uploaded images
    uploads_dir = Path(__file__).parent.parent.parent / "uploads"
    os.makedirs(uploads_dir, exist_ok=True)

    # Generate a unique filename with original extension
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"

    # Save the file
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = uploads_dir / filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Return the path for API use
    return {"filename": filename, "image_url": f"/uploads/{filename}"}


# Mount uploads directory at the "/uploads" path
app.mount(
    "/uploads",
    StaticFiles(directory=str(Path(__file__).parent.parent.parent / "uploads")),
    name="uploads",
)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
