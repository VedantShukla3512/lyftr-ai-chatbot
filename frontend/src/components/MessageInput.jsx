import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

export default function MessageInput({
  value,
  onChange,
  onSubmit,
  isSending,
  hasMessages,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  }

  return (
    <div className={`composer-wrap${hasMessages ? " composer-wrap--thread" : ""}`}>
      <form className="message-composer" onSubmit={onSubmit}>
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          className="message-textarea"
          placeholder="Message Lyftr AI..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isSending}
          aria-label="Message Lyftr AI"
        />
        <div className="composer-toolbar">
          <div className="composer-tools">
            <span className="composer-model">
              <span className="model-indicator" />
              Lyftr Assistant
            </span>
            <span className="composer-divider" />
            <span className="composer-hint">Ready to help</span>
          </div>
          <div className="composer-actions">
            <button className="attach-button" type="button" aria-label="Attachments coming soon" title="Attachments coming soon">
              <Paperclip size={17} />
            </button>
            <button
              data-testid="send-button"
              className="send-button"
              type="submit"
              disabled={isSending || !value.trim()}
              aria-label={isSending ? "Sending message" : "Send message"}
            >
              {isSending ? <Sparkles className="send-loading-icon" size={17} /> : <ArrowUp size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </form>
      <div className="composer-disclaimer">
        Lyftr AI can make mistakes. Consider checking important information.
        <span>Enter to send <kbd>⇧</kbd> + <kbd>↵</kbd> for a new line</span>
      </div>
    </div>
  );
}
