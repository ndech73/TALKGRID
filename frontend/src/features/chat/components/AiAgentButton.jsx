import './AiAgentButton.css';

const AIAgentButton = ({ onClick, hasActivity = false }) => (
  <button className={`ai-agent-btn ${hasActivity ? 'active' : ''}`} onClick={onClick} aria-label="Open AI assistant">
    <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.4" />
    </svg>
    {hasActivity && <span className="ai-agent-btn__pulse" />}
  </button>
);

export default AIAgentButton;