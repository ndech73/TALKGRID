import ChatItem from './ChatItem';
import './ChatList.css';

const ChatList = ({ chats = [], activeChatId, onSelectChat }) => {
  if (!chats.length) {
    return (
      <div className="chat-list chat-list--empty">
        <p>No chats yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onClick={onSelectChat} />
      ))}
    </div>
  );
};

export default ChatList;