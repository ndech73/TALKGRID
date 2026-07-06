import './MessageBubble.css';

const TickIcon = ({ status }) => {
  if (status === 'read')      return <span className="msg-tick read">✓✓</span>;
  if (status === 'delivered') return <span className="msg-tick">✓✓</span>;
  return <span className="msg-tick">✓</span>;
};

const MessageBubble = ({ message }) => {
  const { text, timestamp, isSent, status, type = 'text' } = message;

  return (
    <div className={`msg-bubble-wrap ${isSent ? 'sent' : 'received'}`}>
      <div className={`msg-bubble ${isSent ? 'sent' : 'received'}`}>
        {type === 'text'  && <p className="msg-bubble__text">{text}</p>}
        {type === 'image' && <img className="msg-bubble__img" src={text} alt="Shared" />}
        <div className="msg-bubble__meta">
          <span className="msg-bubble__time">{timestamp}</span>
          {isSent && <TickIcon status={status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;