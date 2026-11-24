
import { Menu, Settings2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import Sidebar from "./components/Sidebar.jsx";

import {
  getHealth,
  sendChatMessage,
  getOrCreateSessionId,
  saveSessionId,
  getSessionMessages,
} from "./services/api.js";

const CONVERSATIONS_KEY = "lyftr_conversations";

function createSessionId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeHistory(payload) {
  const records = Array.isArray(payload)
    ? payload
    : payload?.messages || payload?.items || payload?.data || [];

  if (!Array.isArray(records)) return [];

  return records.flatMap((item, index) => {
    const role = String(
      item.role || item.sender || item.type || ""
    ).toLowerCase();

    const content = item.content || item.message || item.text;

    if (!content || !["user", "assistant"].includes(role)) {
      return [];
    }

    return [
      {
        id: item.id || `history-${index}`,
        role,
        content,
        metadata: item.metadata || null,
      },
    ];
  });
}

function getSavedConversations() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CONVERSATIONS_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function makeTitle(message) {
  return message.length > 35
    ? `${message.slice(0, 35)}...`
    : message;
}

export default function App() {
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);

  const [conversations, setConversations] = useState(
    getSavedConversations
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [systemPrompt, setSystemPrompt] = useState("");
  const [simulateFailure, setSimulateFailure] = useState("");

  const requestId = useRef(0);
  const historyRequestId = useRef(0);

  // Check backend connection.
  const checkHealth = useCallback(async () => {
    try {
      await getHealth();
      setConnectionStatus("online");
    } catch {
      setConnectionStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkHealth();

    const intervalId = window.setInterval(checkHealth, 30000);

    return () => window.clearInterval(intervalId);
  }, [checkHealth]);

  // Save conversation list in browser storage.
  useEffect(() => {
    try {
      localStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(conversations)
      );
    } catch (err) {
      console.error("Could not save conversations:", err);
    }
  }, [conversations]);

  // Restore messages whenever the active conversation changes.
  useEffect(() => {
    const activeId = ++historyRequestId.current;
    let cancelled = false;

    async function loadHistory() {
      setMessages([]);
      setError("");

      try {
        const response = await getSessionMessages(sessionId);

        if (
          cancelled ||
          historyRequestId.current !== activeId
        ) {
          return;
        }

        const restoredMessages = normalizeHistory(response);

        setMessages(restoredMessages);

        // Restore an existing conversation in the sidebar.
        if (restoredMessages.length > 0) {
          const firstUserMessage = restoredMessages.find(
            (item) => item.role === "user"
          );

          const title = firstUserMessage
            ? makeTitle(firstUserMessage.content)
            : "Previous conversation";

          setConversations((current) => {
            const exists = current.some(
              (item) => item.sessionId === sessionId
            );

            if (exists) {
              return current;
            }

            return [
              {
                sessionId,
                title,
                updatedAt: Date.now(),
              },
              ...current,
            ].sort((a, b) => b.updatedAt - a.updatedAt);
          });
        }
      } catch (err) {
        if (
          cancelled ||
          historyRequestId.current !== activeId
        ) {
          return;
        }

        // A new session may not exist in the backend yet.
        if (
          err.message?.includes("404") ||
          err.message?.toLowerCase().includes("session not found")
        ) {
          setMessages([]);
        } else {
          console.error("History loading failed:", err);
          setError("Could not load this conversation. Please try again.");
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Start a completely new conversation.
  function startNewChat() {
    requestId.current++;
    historyRequestId.current++;

    const newId = createSessionId();

    saveSessionId(newId);

    setSessionId(newId);
    setMessages([]);
    setInput("");
    setError("");
    setIsSending(false);
    setMobileSidebarOpen(false);
  }

  // Switch to an existing conversation.
  function selectConversation(selectedId) {
    if (selectedId === sessionId) {
      setMobileSidebarOpen(false);
      return;
    }

    requestId.current++;
    historyRequestId.current++;

    saveSessionId(selectedId);

    setSessionId(selectedId);
    setInput("");
    setError("");
    setIsSending(false);
    setMobileSidebarOpen(false);
  }

  // Send a message to the active conversation.
  async function handleSubmit(event) {
    event?.preventDefault();

    const message = input.trim();

    if (!message || isSending) return;

    const activeRequestId = ++requestId.current;
    const activeSessionId = sessionId;

    setError("");
    setInput("");

    // Show the user's message immediately.
    setMessages((current) => [
      ...current,
      {
        id: `${activeRequestId}-user`,
        role: "user",
        content: message,
      },
    ]);

    // Create or update the conversation in the sidebar.
    setConversations((current) => {
      const existing = current.find(
        (item) => item.sessionId === activeSessionId
      );

      const updated = existing
        ? current.map((item) =>
            item.sessionId === activeSessionId
              ? { ...item, updatedAt: Date.now() }
              : item
          )
        : [
            {
              sessionId: activeSessionId,
              title: makeTitle(message),
              updatedAt: Date.now(),
            },
            ...current,
          ];

      return updated.sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
    });

    setIsSending(true);

    try {
      const response = await sendChatMessage({
        sessionId: activeSessionId,
        message,
        systemPrompt,
        simulateFailure,
      });

      if (requestId.current !== activeRequestId) return;

      if (typeof response.reply !== "string") {
        throw new Error(
          "The backend did not return a valid reply."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `${activeRequestId}-assistant`,
          role: "assistant",
          content: response.reply,
          metadata: response.metadata || null,
        },
      ]);
    } catch (err) {
      if (requestId.current === activeRequestId) {
        setError(
          err.message ||
          "Something went wrong. Please try again."
        );

        setInput(message);

        setMessages((current) =>
          current.filter(
            (item) => item.id !== `${activeRequestId}-user`
          )
        );
      }
    } finally {
      if (requestId.current === activeRequestId) {
        setIsSending(false);
      }
    }
  }

  // Use a suggested prompt.
  function useSuggestion(prompt) {
    setInput(prompt);

    setTimeout(() => {
      document
        .querySelector('[data-testid="chat-input"]')
        ?.focus();
    }, 0);
  }

  const activeConversation = conversations.find(
    (item) => item.sessionId === sessionId
  );

  return (
    <div className="app-shell">
      <Sidebar
        connectionStatus={connectionStatus}
        onNewChat={startNewChat}
        onOpenSettings={() => setSettingsOpen(true)}
        settingsOpen={settingsOpen}
        hasMessages={messages.length > 0}
        conversations={conversations}
        activeSessionId={sessionId}
        onSelectConversation={selectConversation}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-muted">
                Workspace
              </span>

              <span className="breadcrumb-slash">/</span>

              <span className="breadcrumb-current">
                {activeConversation?.title || "New conversation"}
              </span>

              <span className="breadcrumb-badge">
                <span /> PRIVATE
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="topbar-model">
              <Sparkles size={14} /> Lyftr AI
            </span>

            <span className="topbar-divider" />

            <button
              className={`topbar-settings${
                settingsOpen ? " topbar-settings--active" : ""
              }`}
              onClick={() =>
                setSettingsOpen((open) => !open)
              }
            >
              <Settings2 size={16} />
              <span>Settings</span>
            </button>

            <div className="topbar-avatar">L</div>
          </div>
        </header>

        <ChatWindow
          messages={messages}
          isSending={isSending}
          error={error}
          onSuggestion={useSuggestion}
        />

        <footer className="composer-footer">
          <MessageInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isSending={isSending}
            hasMessages={messages.length > 0}
          />
        </footer>
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        simulateFailure={simulateFailure}
        onSimulateFailureChange={setSimulateFailure}
      />
    </div>
  );
}
