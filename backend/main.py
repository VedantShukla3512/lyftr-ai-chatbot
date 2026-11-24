
import os
import json
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, constr
from dotenv import load_dotenv

import litellm
from litellm import completion
from litellm.caching import Cache

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

LLM_API_KEYS = [
    key.strip()
    for key in os.getenv("LLM_API_KEYS", "").split(",")
    if key.strip()
]

LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))

ENABLE_FAILURE_SIMULATION = (
    os.getenv("ENABLE_FAILURE_SIMULATION", "false").lower() == "true"
)

DEFAULT_SYSTEM_PROMPT = (
    "You are Lyftr AI, a helpful, accurate and friendly AI assistant."
)


def get_database_path():
    if not DATABASE_URL.startswith("sqlite:///"):
        raise ValueError("Only SQLite database URLs are supported")

    return DATABASE_URL[len("sqlite:///"):]


def get_connection():
    return sqlite3.connect(get_database_path(), timeout=30)


def initialize_database():
    db_path = get_database_path()
    parent = Path(db_path).parent

    if str(parent) != ".":
        parent.mkdir(parents=True, exist_ok=True)

    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT NOT NULL
            )
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_session
            ON messages(session_id, id)
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                system_prompt TEXT,
                created_at TEXT NOT NULL
            )
        """)


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    litellm.cache = Cache(type="local")
    yield


app = FastAPI(
    title="Lyftr AI Chatbot",
    description="LLM Chatbot with Key Failover and Response Caching",
    version="1.0.0",
    lifespan=lifespan
)


# CORS CONFIGURATION
# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://lyftr-ai-chatbot-1-z6fw.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class ChatRequest(BaseModel):
    session_id: constr(strip_whitespace=True, min_length=1, max_length=128)
    message: constr(strip_whitespace=True, min_length=1, max_length=4000)
    system_prompt: str | None = None


def get_session_prompt(session_id):
    with get_connection() as connection:
        result = connection.execute(
            "SELECT system_prompt FROM sessions WHERE session_id = ?",
            (session_id,)
        ).fetchone()

    return result[0] if result else None


def get_history(session_id):
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT role, content
            FROM messages
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT ?
        """, (session_id, MAX_HISTORY_MESSAGES)).fetchall()

    return [
        {"role": role, "content": content}
        for role, content in reversed(rows)
    ]


def parse_simulation(header):
    failures = {}

    if not ENABLE_FAILURE_SIMULATION or not header:
        return failures

    for item in header.split(","):
        try:
            key_id, status = item.strip().split("=")

            if status not in {"429", "500", "502", "503"}:
                continue

            failures[key_id.strip()] = int(status)

        except ValueError:
            continue

    return failures


def save_messages(session_id, user_message, reply, metadata, system_prompt):
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        connection.execute("""
            INSERT INTO sessions (session_id, system_prompt, created_at)
            VALUES (?, ?, ?)
            ON CONFLICT(session_id)
            DO UPDATE SET system_prompt = excluded.system_prompt
        """, (session_id, system_prompt, now))

        connection.execute("""
            INSERT INTO messages
            (session_id, role, content, metadata, created_at)
            VALUES (?, 'user', ?, NULL, ?)
        """, (session_id, user_message, now))

        connection.execute("""
            INSERT INTO messages
            (session_id, role, content, metadata, created_at)
            VALUES (?, 'assistant', ?, ?, ?)
        """, (
            session_id,
            reply,
            json.dumps(metadata),
            now
        ))


# HEALTH ENDPOINT
@app.get("/health")
def health_check():
    try:
        with get_connection() as connection:
            connection.execute("SELECT 1")

        return {
            "status": "ok",
            "keys_configured": len(LLM_API_KEYS),
            "cache_enabled": litellm.cache is not None
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )


# CHAT ENDPOINT
@app.post("/chat")
def chat(
    request: ChatRequest,
    x_simulate_failure: str | None = Header(
        default=None,
        alias="X-Simulate-Failure"
    )
):
    if not LLM_API_KEYS:
        raise HTTPException(
            status_code=503,
            detail="all providers unavailable"
        )

    session_id = request.session_id
    user_message = request.message

    system_prompt = (
        request.system_prompt
        if request.system_prompt is not None
        else get_session_prompt(session_id)
    ) or DEFAULT_SYSTEM_PROMPT

    history = get_history(session_id)

    messages = [
        {"role": "system", "content": system_prompt}
    ]

    messages.extend(history)

    messages.append({
        "role": "user",
        "content": user_message
    })

    failures = parse_simulation(x_simulate_failure)

    start_time = time.perf_counter()

    reply = None
    key_id = None
    fallback_attempts = 0
    input_tokens = 0
    output_tokens = 0
    cache_hit = False

    for index, api_key in enumerate(LLM_API_KEYS):
        current_key_id = f"key_{index + 1}"

        if current_key_id in failures or "*" in failures:
            fallback_attempts += 1
            continue

        try:
            response = completion(
                model=LLM_MODEL,
                messages=messages,
                api_key=api_key,
                caching=True
            )

            reply = response.choices[0].message.content

            if not reply:
                raise ValueError("Empty model response")

            usage = response.usage

            input_tokens = (
                getattr(usage, "prompt_tokens", 0) or 0
            )

            output_tokens = (
                getattr(usage, "completion_tokens", 0) or 0
            )

            hidden = getattr(response, "_hidden_params", {}) or {}
            cache_hit = bool(hidden.get("cache_hit", False))

            key_id = None if cache_hit else current_key_id

            if cache_hit:
                fallback_attempts = 0

            break

        except Exception:
            fallback_attempts += 1
            continue

    if reply is None:
        raise HTTPException(
            status_code=503,
            detail="all providers unavailable"
        )

    latency_ms = int(
        (time.perf_counter() - start_time) * 1000
    )

    metadata = {
        "resolution_source": (
            "LLM_CACHE" if cache_hit else "LIVE_INFERENCE"
        ),
        "model": LLM_MODEL,
        "latency_ms": latency_ms,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "key_id": key_id,
        "fallback_attempts": fallback_attempts
    }

    save_messages(
        session_id,
        user_message,
        reply,
        metadata,
        system_prompt
    )

    return {
        "session_id": session_id,
        "reply": reply,
        "metadata": metadata
    }


# SESSION HISTORY ENDPOINT
@app.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    with get_connection() as connection:
        session = connection.execute(
            "SELECT session_id FROM sessions WHERE session_id = ?",
            (session_id,)
        ).fetchone()

        if not session:
            raise HTTPException(
                status_code=404,
                detail="session not found"
            )

        rows = connection.execute("""
            SELECT role, content, metadata
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC
        """, (session_id,)).fetchall()

    messages = []

    for role, content, metadata in rows:
        item = {
            "role": role,
            "content": content
        }

        if metadata:
            item["metadata"] = json.loads(metadata)

        messages.append(item)

    return {
        "session_id": session_id,
        "messages": messages
    }
