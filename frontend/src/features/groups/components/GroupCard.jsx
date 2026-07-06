import Avatar from '../../../shared/components/Avatar';
import NotificationBadge from '../../../shared/components/NotificationBadge';
import './GroupCard.css';

const GroupCard = ({ group, onClick }) => {
  const { name, avatar, memberCount, lastMessage, timestamp, unreadCount } = group;

  return (
    <button className="group-card" onClick={() => onClick?.(group)}>
      <Avatar src={avatar} name={name} size={46} />
      <div className="group-card__body">
        <div className="group-card__row">
          <span className="group-card__name">{name}</span>
          <span className={`group-card__time ${unreadCount ? 'unread' : ''}`}>{timestamp}</span>
        </div>
        <div className="group-card__row">
          <span className="group-card__preview">{lastMessage}</span>
          <div className="group-card__right">
            <span className="group-card__members">{memberCount} members</span>
            <NotificationBadge count={unreadCount} />
          </div>
        </div>
      </div>
    </button>
  );
};

export default GroupCard;