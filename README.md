# Lyftr AI – AI Chatbot

## 1. Live URLs

- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:8000
- **Backend Health Check:** http://localhost:8000/health

*The application is currently configured for local development. Add deployed URLs here when hosting is completed.*

## 2. Run Locally: With Docker and Without Docker

### With Docker

**Prerequisites:**
- Docker Desktop
- Docker Compose

**Steps:**

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd lyftr-ai-chatbot
   ```

2. Configure the required environment variables and Groq API key in the backend environment configuration.

3. Build and start the application:
   ```bash
   docker compose up --build
   ```

4. Open the application:
   - Frontend: http://localhost:8080
   - Backend: http://localhost:8000
   - Health Check: http://localhost:8000/health

5. Stop the application:
   ```bash
   docker compose down
   ```

### Without Docker

**Prerequisites:**
- Python
- Node.js and npm
- Groq API key

**Backend setup:**

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   ```

   Windows PowerShell:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure the required environment variables.

5. Start the FastAPI server using the project's configured entry point.

**Frontend setup:**

1. Open another terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the frontend URL displayed in the terminal.

## 3. Design Decisions: Key Fallback, Caching, SQLite Session Storage

### Key Fallback

- Multiple API keys can be configured through environment variables.
- The application uses a key fallback mechanism to improve reliability.
- If an API request fails with one configured key, the system attempts another available key.
- This helps reduce service interruptions caused by temporary provider or key-related failures.

### Caching

- LiteLLM local caching is used to avoid unnecessary repeated API calls.
- Repeated requests with matching cache keys can return cached responses.
- Caching helps reduce response latency and unnecessary API usage.

### SQLite Session Storage

- SQLite is used for persistent chat message and session storage.
- Messages are associated with session IDs.
- This allows conversations to be retrieved using their session IDs.
- The backend exposes an endpoint to retrieve messages for a particular session.

## 4. Verification: How to See Failover, Cache Hits and Per-Message Token Usage

### Failover Verification

1. Configure multiple valid API keys.
2. Start the application.
3. Trigger a provider failure or simulate a failure using the supported failure-simulation mechanism.
4. Inspect backend logs and response metadata.
5. Verify whether another configured key is attempted.

### Cache Hit Verification

1. Enable the LiteLLM local cache.
2. Send a message to the chatbot.
3. Send the exact same request again using the same settings and session context.
4. Inspect the backend logs and response metadata for cache-related information.
5. Compare response latency to observe the effect of caching.

### Per-Message Token Usage

- Send a message through the chatbot.
- Inspect the response metadata returned by the backend.
- Check the input token count and output token count.
- Token usage is available alongside other response information such as latency and model details.

## 5. Setup Used: Your Editor and AI Tools

### Development Environment

- **Code Editor:** Visual Studio Code
- **Frontend:** React, Vite, JavaScript and CSS
- **Backend:** Python and FastAPI
- **AI Integration:** LiteLLM and Groq API
- **Database:** SQLite
- **Containerization:** Docker and Docker Compose
- **Version Control:** Git and GitHub

### AI Development Tools

- ChatGPT – Assistance with implementation, debugging, code explanations and documentation.
- GitHub Copilot – Coding assistance and development support.

## 6. Bonus Features (if any): What You Added Beyond the Requirements and Why

### Additional Features

- **Conversation Management:** Ability to create and switch between multiple conversations.
- **Persistent Session IDs:** Browser local storage is used to retain the active conversation ID.
- **Chat History Restoration:** Previously stored messages can be retrieved using the session ID.
- **Health Monitoring:** Backend connectivity is checked periodically to display connection status.
- **Failure Simulation:** Supports testing failure-handling behaviour through a dedicated request header.
- **Settings Panel:** Provides controls for system prompts and failure simulation.
- **Modern Dark UI:** A responsive, dark-themed chatbot interface with a sidebar and message composer.

These features improve usability, reliability, debugging and the overall user experience.
