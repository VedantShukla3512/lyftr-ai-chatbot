import { AlertCircle, Check, RotateCcw, Settings2, X } from "lucide-react";

export default function SettingsPanel({
  isOpen,
  onClose,
  systemPrompt,
  onSystemPromptChange,
  simulateFailure,
  onSimulateFailureChange,
}) {
  if (!isOpen) return null;

  return (
    <>
      <button className="settings-backdrop" onClick={onClose} aria-label="Close settings" />
      <aside className="settings-panel" aria-label="Chat settings">
        <div className="settings-panel-header">
          <div className="settings-heading-icon"><Settings2 size={18} /></div>
          <div>
            <h2>Settings</h2>
            <p>Personalize your workspace</p>
          </div>
          <button className="icon-button settings-close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>
        <div className="settings-content">
          <div className="settings-field">
            <div className="field-heading">
              <label htmlFor="system-prompt">System prompt</label>
              <span className="optional-label">OPTIONAL</span>
            </div>
            <p className="field-description">
              Set the tone and behavior Lyftr AI should use for this conversation.
            </p>
            <textarea
              id="system-prompt"
              data-testid="system-prompt-input"
              className="settings-textarea"
              placeholder="You are a thoughtful, concise assistant..."
              value={systemPrompt}
              onChange={(event) => onSystemPromptChange(event.target.value)}
              rows={5}
            />
            <span className="field-footnote"><Check size={13} /> Applied to your next message</span>
          </div>

          <div className="settings-separator" />

          <div className="settings-field">
            <div className="field-heading">
              <label htmlFor="simulate-failure">Failure simulation</label>
              <span className="testing-label"><AlertCircle size={11} /> TESTING</span>
            </div>
            <p className="field-description">
              Send a test value in the <code>X-Simulate-Failure</code> header.
            </p>
            <input
              id="simulate-failure"
              className="settings-input"
              placeholder="e.g. provider_error"
              value={simulateFailure}
              onChange={(event) => onSimulateFailureChange(event.target.value)}
            />
            <span className="field-footnote"><AlertCircle size={13} /> Leave blank for normal requests</span>
          </div>

          <div className="settings-note">
            <span className="settings-note-icon"><RotateCcw size={15} /></span>
            <p>Settings are stored in this page only and reset when you refresh.</p>
          </div>
        </div>
        <div className="settings-panel-footer">
          <span className="footer-save-indicator" />
          Changes apply automatically
        </div>
      </aside>
    </>
  );
}
