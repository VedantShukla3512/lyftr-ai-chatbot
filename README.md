# Lyftr AI Chatbot

An AI-powered chatbot with API key failover, response caching, and conversation management.

## Features
- AI-powered conversational interface
- API key failover mechanism
- Response caching
- Conversation management
- Backend API integration

## Tech Stack
- Python
- FastAPI
- Frontend technologies (as implemented)

## Project Structure
```text
lyftr-ai-chatbot/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
├── .gitignore
└── README.md
```

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Create and activate a virtual environment.
4. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

## Running the Backend

```bash
cd backend
uvicorn main:app --reload
```

## API Documentation

Once the backend is running, visit:

`http://127.0.0.1:8000/docs`
