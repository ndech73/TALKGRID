import Avatar from '../Avatar';
import NotificationBadge from '../NotificationBadge';
import './ChatItem.css';

const ChatItem = ({ chat, onClick, isActive = false }) => {
  const { name, avatar, lastMessage, timestamp, unreadCount, isOnline, isGroup } = chat;

  return (
    <button className={`chat-item ${isActive ? 'active' : ''}`} onClick={() => onClick?.(chat)}>
      <Avatar src={avatar} name={name} size={46} showOnline={!isGroup} isOnline={isOnline} />
      <div className="chat-item__body">
        <div className="chat-item__row">
          <span className="chat-item__name">{name}</span>
          <span className={`chat-item__time ${unreadCount ? 'unread' : ''}`}>{timestamp}</span>
        </div>
        <div className="chat-item__row">
          <span className={`chat-item__preview ${unreadCount ? 'unread' : ''}`}>{lastMessage}</span>
          <NotificationBadge count={unreadCount} />
        </div>
      </div>
    </button>
  );
};

export default ChatItem;