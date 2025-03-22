"""
Database module for conversation persistence.

This module provides a simple SQLite-based database for storing and retrieving
conversation histories.
"""

import asyncio
import os
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import List, Any, TypeVar, Callable, ParamSpec, Optional, Dict
from pathlib import Path

from pydantic_ai.messages import ModelMessage, ModelMessagesTypeAdapter

# Type variables for _asyncify
P = ParamSpec("P")
R = TypeVar("R")

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent.absolute()


class Database:
    """Database for storing chat messages using SQLite.

    The SQLite standard library is synchronous, so we use a ThreadPoolExecutor
    to run database operations asynchronously.
    """

    def __init__(self, db_path: str = None):
        """Initialize the database with the given path.

        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.con: Optional[sqlite3.Connection] = None
        self._loop = asyncio.get_event_loop()
        self._executor = ThreadPoolExecutor(max_workers=1)

    async def connect(self):
        """Connect to the database and create tables if they don't exist."""
        if self.con is None:
            self.con = await self._loop.run_in_executor(
                self._executor, self._connect, self.db_path
            )

    def _connect(self, db_path: str) -> sqlite3.Connection:
        """Create a connection to the SQLite database.

        Args:
            db_path: Path to the SQLite database file

        Returns:
            SQLite connection object
        """
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        # Create tables if they don't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                username TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                message_list TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)

        # Create table for session preferences
        cur.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                session_id TEXT,
                key TEXT,
                value TEXT,
                PRIMARY KEY (session_id, key),
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)

        con.commit()
        return con

    async def close(self):
        """Close the database connection."""
        if self.con:
            await self._asyncify(self.con.close)
            self.con = None

    async def add_session(self, session_id: str, username: str) -> None:
        """Add a new chat session.

        Args:
            session_id: Unique identifier for the session
            username: Name of the user for this session
        """
        await self.connect()
        await self._asyncify(
            self._execute,
            "INSERT OR REPLACE INTO sessions (id, username, last_used) VALUES (?, ?, CURRENT_TIMESTAMP)",
            session_id,
            username,
            commit=True,
        )

    async def update_session_last_used(self, session_id: str) -> None:
        """Update the last_used timestamp for a session.

        Args:
            session_id: Unique identifier for the session
        """
        await self.connect()
        await self._asyncify(
            self._execute,
            "UPDATE sessions SET last_used = CURRENT_TIMESTAMP WHERE id = ?",
            session_id,
            commit=True,
        )

    async def add_messages(self, session_id: str, messages_json: bytes) -> None:
        """Add messages to a session.

        Args:
            session_id: Unique identifier for the session
            messages_json: JSON serialized messages from result.new_messages_json()
        """
        await self.connect()
        await self._asyncify(
            self._execute,
            "INSERT INTO messages (session_id, message_list) VALUES (?, ?)",
            session_id,
            messages_json,
            commit=True,
        )

    async def get_messages(self, session_id: str) -> List[ModelMessage]:
        """Get all messages for a session.

        Args:
            session_id: Unique identifier for the session

        Returns:
            List of ModelMessage objects
        """
        await self.connect()
        cursor = await self._asyncify(
            self._execute,
            "SELECT message_list FROM messages WHERE session_id = ? ORDER BY id",
            session_id,
        )
        rows = await self._asyncify(cursor.fetchall)

        messages: List[ModelMessage] = []
        for row in rows:
            messages.extend(ModelMessagesTypeAdapter.validate_json(row[0]))

        return messages

    async def set_preference(self, session_id: str, key: str, value: str) -> None:
        """Set a preference for a session.

        Args:
            session_id: Unique identifier for the session
            key: Preference key
            value: Preference value
        """
        await self.connect()
        await self._asyncify(
            self._execute,
            "INSERT OR REPLACE INTO preferences (session_id, key, value) VALUES (?, ?, ?)",
            session_id,
            key,
            value,
            commit=True,
        )

    async def get_preferences(self, session_id: str) -> Dict[str, str]:
        """Get all preferences for a session.

        Args:
            session_id: Unique identifier for the session

        Returns:
            Dictionary of preferences
        """
        await self.connect()
        cursor = await self._asyncify(
            self._execute,
            "SELECT key, value FROM preferences WHERE session_id = ?",
            session_id,
        )
        rows = await self._asyncify(cursor.fetchall)

        return {row[0]: row[1] for row in rows}

    async def list_sessions(self) -> List[Dict[str, Any]]:
        """List all sessions.

        Returns:
            List of session dictionaries with id, username, and timestamps
        """
        await self.connect()
        cursor = await self._asyncify(
            self._execute,
            "SELECT id, username, created_at, last_used FROM sessions ORDER BY last_used DESC",
        )
        rows = await self._asyncify(cursor.fetchall)

        return [
            {
                "id": row[0],
                "username": row[1],
                "created_at": row[2],
                "last_used": row[3],
            }
            for row in rows
        ]

    async def clear_session(self, session_id: str) -> None:
        """Clear all messages for a session.

        Args:
            session_id: Unique identifier for the session
        """
        await self.connect()
        await self._asyncify(
            self._execute,
            "DELETE FROM messages WHERE session_id = ?",
            session_id,
            commit=True,
        )

    async def delete_session(self, session_id: str) -> None:
        """Delete a session and all its messages and preferences.

        Args:
            session_id: Unique identifier for the session
        """
        await self.connect()
        # Delete messages
        await self._asyncify(
            self._execute,
            "DELETE FROM messages WHERE session_id = ?",
            session_id,
            commit=True,
        )

        # Delete preferences
        await self._asyncify(
            self._execute,
            "DELETE FROM preferences WHERE session_id = ?",
            session_id,
            commit=True,
        )

        # Delete session
        await self._asyncify(
            self._execute, "DELETE FROM sessions WHERE id = ?", session_id, commit=True
        )

    def _execute(self, sql: str, *args: Any, commit: bool = False) -> sqlite3.Cursor:
        """Execute an SQL query.

        Args:
            sql: SQL query
            *args: Query parameters
            commit: Whether to commit after execution

        Returns:
            SQLite cursor object
        """
        assert self.con is not None, "Database not connected"
        cur = self.con.cursor()
        cur.execute(sql, args)
        if commit:
            self.con.commit()
        return cur

    async def _asyncify(
        self, func: Callable[P, R], *args: P.args, **kwargs: P.kwargs
    ) -> R:
        """Run a synchronous function asynchronously.

        Args:
            func: Function to run
            *args: Function arguments
            **kwargs: Function keyword arguments

        Returns:
            Function result
        """
        return await self._loop.run_in_executor(
            self._executor,
            partial(func, **kwargs),
            *args,
        )

    async def get_raw_message_json(self, session_id: str) -> List[bytes]:
        """Get raw message JSON bytes from the database.

        This method returns the raw JSON bytes as stored in the database,
        without deserializing them. This is useful for extracting custom fields
        that might be dropped during deserialization.

        Args:
            session_id: Unique identifier for the session

        Returns:
            List of raw message JSON bytes
        """
        await self.connect()
        cursor = await self._asyncify(
            self._execute,
            "SELECT message_list FROM messages WHERE session_id = ? ORDER BY id",
            session_id,
        )
        rows = await self._asyncify(cursor.fetchall)

        return [row[0] for row in rows]


# Create a singleton database instance
_db_instance = None


async def get_database() -> Database:
    """Get the database instance.

    Returns:
        Database object
    """
    global _db_instance
    if _db_instance is None:
        # Get database path from environment or use default
        db_path = os.environ.get("CHAT_DB_PATH")
        if db_path is None:
            db_path = str(PROJECT_ROOT / "backend" / "database" / "chat_data.sqlite")

        # Ensure the database directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

        _db_instance = Database(db_path)
        await _db_instance.connect()
    return _db_instance
