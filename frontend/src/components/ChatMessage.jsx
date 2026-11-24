
import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Metadata from "./Metadata.jsx";

// Custom code block with Copy functionality
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const codeElement = children;
  const code = String(codeElement?.props?.children ?? "").replace(/\n$/, "");
  const languageClass = codeElement?.props?.className || "";
  const language = languageClass.match(/language-(\w+)/)?.[1] || "code";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language}</span>
        <button
          type="button"
          className="code-copy-button"
          onClick={copyCode}
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre>
        {children}
      </pre>
    </div>
  );
}

export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <article className="message-row message-row--user">
        <div className="user-message-bubble">{message.content}</div>
        <div className="user-avatar">Y</div>
      </article>
    );
  }

  return (
    <article
      className="message-row message-row--assistant"
      data-testid="assistant-message"
    >
      <div className="assistant-avatar">
        <Sparkles size={16} strokeWidth={2} />
      </div>

      <div className="assistant-message-content">
        <div className="assistant-message-heading">
          <strong>Lyftr AI</strong>
          <span className="message-status-dot" />
          <span className="message-status-text">Just now</span>
        </div>

        <div className="assistant-message-bubble markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: CodeBlock,
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.metadata && (
          <Metadata metadata={message.metadata} />
        )}
      </div>
    </article>
  );
}
