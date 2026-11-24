import { Menu, Settings2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { getHealth, sendChatMessage } from "./services/api.js";

function createSessionId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  const values = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(values);
  if (values.some((value) => value !== 0)) {
    return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [sessionId, setSessionId] = useState(createSessionId);
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

  function startNewChat() {
    requestId.current += 1;
    setSessionId(createSessionId());
    setMessages([]);
    setInput("");
    setIsSending(false);
    setError("");
    setMobileSidebarOpen(false);
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const activeRequestId = ++requestId.current;
    const activeSessionId = sessionId;
    setError("");
    setInput("");
    setMessages((current) => [
      ...current,
      { id: `${activeRequestId}-user`, role: "user", content: message },
    ]);
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
        throw new Error("The backend response did not include a valid reply.");
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
    } catch (requestError) {
      if (requestId.current === activeRequestId) {
        setError(requestError instanceof Error ? requestError.message : "Something went wrong. Please try again.");
        setInput(message);
      }
    } finally {
      if (requestId.current === activeRequestId) {
        setIsSending(false);
      }
    }
  }

  function useSuggestion(prompt) {
    setInput(prompt);
    setTimeout(() => document.querySelector('[data-testid="chat-input"]')?.focus(), 0);
  }

  return (
    <div className="app-shell">
      <Sidebar
        connectionStatus={connectionStatus}
        onNewChat={startNewChat}
        onOpenSettings={() => setSettingsOpen(true)}
        settingsOpen={settingsOpen}
        hasMessages={messages.length > 0}
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
              <span className="breadcrumb-muted">Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <span className="breadcrumb-current">New conversation</span>
              <span className="breadcrumb-badge"><span /> PRIVATE</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-model"><Sparkles size={14} /> Lyftr AI</span>
            <span className="topbar-divider" />
            <button
              className={`topbar-settings${settingsOpen ? " topbar-settings--active" : ""}`}
              onClick={() => setSettingsOpen((open) => !open)}
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
