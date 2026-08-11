export default function EmptyState({ mode, onExampleClick }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{mode.icon}</div>
      <h2 className="empty-title">{mode.label}</h2>
      <p className="empty-desc">{mode.description}</p>

      <div className="examples-grid">
        <p className="examples-label">Try an example:</p>
        {mode.examples.map((example, i) => (
          <button
            key={i}
            className="example-btn"
            onClick={() => onExampleClick(example)}
          >
            <span className="example-arrow">→</span>
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
