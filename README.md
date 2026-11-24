# ✨ Lyftr AI – Intelligent AI Chatbot

An AI-powered conversational application built with **React and FastAPI**, featuring intelligent response generation, API provider failover, response caching, and conversation management.

Lyftr AI provides a clean, modern chat experience designed to make interacting with AI models simple, efficient, and reliable.

## 🚀 Features

- **AI-Powered Conversations:** Interact with AI models through a conversational interface.
- **API Key Failover:** Automatically handles provider failures using the configured fallback mechanism.
- **Response Caching:** Improves efficiency by reusing cached responses where applicable.
- **Conversation Management:** Maintain separate chat sessions using unique session IDs.
- **Custom System Prompts:** Customize the assistant's behavior and response style.
- **Failure Simulation:** Test error-handling and provider-failure scenarios.
- **Live Backend Monitoring:** Monitor backend connectivity through health checks.
- **Responsive Interface:** Modern dark-themed user interface with an intuitive chat experience.

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS3
- Lucide React

### Backend
- Python
- FastAPI
- Uvicorn

### AI Integration
- Groq / OpenAI-compatible API providers (as configured)

### Development Tools
- Visual Studio Code
- Git
- GitHub

## 📁 Project Structure

```text
lyftr-ai-chatbot/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Metadata.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VedantShukla3512/lyftr-ai-chatbot.git
```

```bash
cd lyftr-ai-chatbot
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the environment on Windows:

```bash
.venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables in the backend `.env` file using the variable names required by your backend implementation.

Start the backend:

```bash
uvicorn main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔌 API Documentation

The backend exposes the following API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks backend health and connectivity |
| POST | `/chat` | Processes chat messages and generates AI responses |

Interactive API documentation is available through FastAPI:

```text
http://localhost:8000/docs
```

## 🔐 Environment Configuration

The application requires API credentials for the configured AI providers.

- Store API keys in environment variables.
- Never commit `.env` files or API credentials to GitHub.
- Configure the required environment variable names according to the backend implementation.

## 🖥️ Application Preview

Screenshots of the application will be added here.

### Chat Interface
<!-- Add your chat interface screenshot here -->

### Settings Panel
<!-- Add your settings panel screenshot here -->

## 🎯 Future Enhancements

- User authentication and account management.
- Persistent conversation history.
- Improved streaming responses.
- Additional AI model integrations.
- Production deployment.
- Enhanced analytics and response monitoring.

## 👨‍💻 Developer

**Vedant Shukla**

B.Tech – Computer Science Engineering (AIML)




---

⭐ If you find this project interesting, consider giving it a star on GitHub!

**Built with curiosity and a passion for AI.**
