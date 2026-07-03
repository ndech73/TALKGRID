import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ title, showBack = false, showLogo = false, onAIAgent, actions = [] }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar__left">
        {showBack && (
          <button className="topbar__icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {showLogo && (
          <div className="topbar__logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 19H20L12 3Z" stroke="#7DD3E8" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 7.5L7.5 16.5H16.5L12 7.5Z" stroke="#A78BFA" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="10.3" cy="14.2" r="0.9" fill="var(--primary)" />
              <circle cx="12" cy="14.2" r="0.9" fill="var(--primary)" />
              <circle cx="13.7" cy="14.2" r="0.9" fill="var(--primary)" />
            </svg>
            <span className="topbar__brand">TRIAD</span>
          </div>
        )}
        {title && <h1 className="topbar__title">{title}</h1>}
      </div>
      <div className="topbar__right">
        {onAIAgent && (
          <button className="topbar__icon-btn topbar__ai-btn" onClick={onAIAgent} aria-label="Open AI assistant">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {actions.map((action, i) => (
          <button key={i} className="topbar__icon-btn" onClick={action.onClick} aria-label={action.label}>
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;