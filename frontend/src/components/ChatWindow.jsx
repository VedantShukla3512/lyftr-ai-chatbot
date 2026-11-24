import { ArrowDown, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";

const suggestions = [
  { title: "Think through an idea", prompt: "Help me think through an idea I have..." },
  { title: "Write something great", prompt: "Help me write a polished, engaging..." },
  { title: "Make sense of a topic", prompt: "Explain this topic clearly and simply..." },
];

export default function ChatWindow({ messages, isSending, error, onSuggestion }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending, error]);

  return (
    <main className="chat-window">
      <div className="message-scroll-area" ref={scrollRef}>
        {messages.length === 0 ? (
          <section className="welcome-screen">
            <div className="welcome-orb">
              <div className="welcome-orb-inner">
                <Sparkles size={27} strokeWidth={1.7} />
              </div>
              <span className="orb-ring orb-ring--one" />
              <span className="orb-ring orb-ring--two" />
            </div>
            <div className="welcome-eyebrow">
              <span className="eyebrow-line" />
              YOUR AI WORKSPACE
              <span className="eyebrow-line" />
            </div>
            <h1>Ideas, meet <span>elevation.</span></h1>
            <p className="welcome-description">
              Your thought partner for the big questions, tiny details,
              <br className="desktop-break" /> and everything in between.
            </p>
            <div className="welcome-greeting">
              <span className="greeting-sparkle"><Sparkles size={15} /></span>
              <span>Hey there! What would you like to work on today?</span>
            </div>
            <div className="suggestion-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  className="suggestion-card"
                  key={suggestion.title}
                  onClick={() => onSuggestion(suggestion.prompt)}
                >
                  <span className={`suggestion-icon suggestion-icon--${index + 1}`}>
                    {index === 0 ? "✳" : index === 1 ? "Aa" : "◈"}
                  </span>
                  <span className="suggestion-title">{suggestion.title}</span>
                  <span className="suggestion-prompt">{suggestion.prompt}</span>
                  <ArrowDown className="suggestion-arrow" size={15} />
                </button>
              ))}
            </div>
            <div className="welcome-footnote">
              <span className="footnote-dot" />
              Powered by your Lyftr AI workspace
            </div>
          </section>
        ) : (
          <div className="message-list">
            <div className="thread-date">
              <span />
              TODAY
              <span />
            </div>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isSending && (
              <div className="typing-row" aria-label="Lyftr AI is responding">
                <div className="typing-avatar"><Sparkles size={15} /></div>
                <div className="typing-content">
                  <span className="typing-label">Lyftr AI</span>
                  <span className="typing-dots"><i /><i /><i /></span>
                </div>
              </div>
            )}
            {error && (
              <div className="error-banner" role="alert">
                <span className="error-symbol">!</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
