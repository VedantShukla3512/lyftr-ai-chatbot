
import {
  Activity,
  ChevronDown,
  MessageSquareText,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  connectionStatus,
  onNewChat,
  onOpenSettings,
  settingsOpen,
  hasMessages,
  mobileOpen,
  onCloseMobile,
  conversations = [],
  activeSessionId = "",
  onSelectConversation = () => {},
}) {
  const statusLabel = {
    checking: "Checking connection",
    online: "Backend connected",
    offline: "Backend unavailable",
  }[connectionStatus];

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} strokeWidth={2.2} />
          </div>

          <div className="brand-copy">
            <span className="brand-name">lyftr<span>ai</span></span>
            <span className="brand-caption">
              INTELLIGENCE, ELEVATED
            </span>
          </div>

          <button
            className="icon-button sidebar-collapse"
            aria-label="Close navigation"
            onClick={onCloseMobile}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={18} strokeWidth={2.2} />
          <span>New chat</span>
          <span className="shortcut">⌘ K</span>
        </button>

        <div className="sidebar-section">
          <div className="section-label">WORKSPACE</div>

          <div className="conversation-heading">
            <span>Conversations</span>
            <span className="conversation-count">
              {conversations.length}
            </span>
          </div>

          {conversations.length > 0 ? (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  key={conversation.sessionId}
                  className={`conversation-item ${
                    activeSessionId === conversation.sessionId
                      ? "conversation-item--active"
                      : ""
                  }`}
                  onClick={() => {
                    onSelectConversation(conversation.sessionId);
                    onCloseMobile?.();
                  }}
                  title={conversation.title}
                >
                  <MessageSquareText size={16} />
                  <span>
                    {conversation.title || "New conversation"}
                  </span>

                  {activeSessionId === conversation.sessionId && (
                    <span className="conversation-active-dot" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-conversations">
              <span className="empty-conversations-icon">
                <MessageSquareText size={17} />
              </span>
              <span>
                Your conversations
                <br />
                will appear here
              </span>
            </div>
          )}
        </div>

        <div className="sidebar-spacer" />

        <div className={`connection-card connection-card--${connectionStatus}`}>
          <div className="connection-icon">
            <Activity size={17} />
          </div>

          <div className="connection-copy">
            <span className="connection-title">{statusLabel}</span>
            <span className="connection-detail">
              {connectionStatus === "online"
                ? "Ready for your next prompt"
                : connectionStatus === "checking"
                  ? "Connecting to your workspace"
                  : "Check your API server"}
            </span>
          </div>

          <span className="connection-indicator" />
        </div>

        <button
          className={`settings-nav${
            settingsOpen ? " settings-nav--active" : ""
          }`}
          onClick={onOpenSettings}
        >
          <Settings2 size={17} />
          <span>Settings</span>
          <span className="settings-nav-label">
            {settingsOpen ? "OPEN" : ""}
          </span>
        </button>

        <div className="sidebar-footer">
          <span className="footer-avatar">L</span>
          <span className="footer-account">
            <strong>Lyftr workspace</strong>
            <small>Personal account</small>
          </span>
          <span className="footer-plan">BETA</span>
        </div>
      </aside>
    </>
  );
}
