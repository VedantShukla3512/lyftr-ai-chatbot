
import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()


# Read the database location from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")


# Convert SQLite URL into a database file path
def get_database_path():
    if not DATABASE_URL.startswith("sqlite:///"):
        raise ValueError("Only SQLite database URLs are supported")

    return DATABASE_URL[len("sqlite:///"):]


# Create the database table when the application starts
def initialize_database():
    db_path = get_database_path()

    # Create the parent directory if it does not exist
    parent = Path(db_path).parent
    if str(parent) != ".":
        parent.mkdir(parents=True, exist_ok=True)

    # Connect to SQLite
    connection = sqlite3.connect(db_path)

    # Create messages table
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

    connection.commit()
    connection.close()


# Run database initialization during application startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


# Create our FastAPI application
app = FastAPI(
    title="Lyftr AI Chatbot",
    description="LLM Chatbot with Key Failover and Response Caching",
    version="1.0.0",
    lifespan=lifespan
)


# Health-check endpoint
@app.get("/health")
def health_check():
    db_path = get_database_path()

    # Check whether the database is reachable
    connection = sqlite3.connect(db_path)
    connection.execute("SELECT 1")
    connection.close()

    # Count configured API keys
    api_keys = os.getenv("LLM_API_KEYS", "")
    keys_configured = len([
        key for key in api_keys.split(",") if key.strip()
    ])

    return {
        "status": "ok",
        "keys_configured": keys_configured,
        "cache_enabled": False
    }
