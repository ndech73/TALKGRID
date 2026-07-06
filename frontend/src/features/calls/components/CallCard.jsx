import Avatar from '../../../shared/components/Avatar';
import './CallCard.css';

const CallCard = ({ call, onCallBack }) => {
  const { name, avatar, type, direction, duration, timestamp } = call;
  const isMissed = direction === 'missed';

  return (
    <div className={`call-card ${isMissed ? 'missed' : ''}`}>
      <Avatar src={avatar} name={name} size={46} />
      <div className="call-card__body">
        <span className="call-card__name">{name}</span>
        <div className="call-card__meta">
          <span className={`call-card__direction ${isMissed ? 'missed' : ''}`}>
            {direction === 'incoming' ? '↙' : direction === 'outgoing' ? '↗' : '✕'}{' '}
            {direction === 'missed' ? 'Missed' : direction}{' · '}
            {type === 'video' ? '📹' : '📞'}
            {duration && ` · ${duration}`}
          </span>
          <span className="call-card__time">{timestamp}</span>
        </div>
      </div>
      <button className="call-card__callback" onClick={() => onCallBack?.(call)} aria-label={`Call ${name} back`}>
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default CallCard;