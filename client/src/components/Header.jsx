export default function Header({ mode, specialist, model, onClear, messageCount }) {
  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="header-mode-icon" style={{ '--mode-color': mode.color }}>
          {mode.icon}
        </div>
        <div className="header-info">
          <h2 className="header-title">{mode.label}</h2>
          <p className="header-desc">{mode.description}</p>
        </div>
      </div>

      <div className="header-right">
        {specialist && (
          <div className="specialist-badge">
            <div className="specialist-name">{specialist}</div>
            <div className="specialist-model" title={model}>
              {model ? model.split('/').pop() : 'Loading...'}
            </div>
          </div>
        )}
        {messageCount > 0 && (
          <button className="clear-btn" onClick={onClear} title="Clear chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Clear
          </button>
        )}
      </div>
    </header>
  );
}
