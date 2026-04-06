import '../styles/Home.css'

function Home() {
  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💬 talkgrid</h2>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="🔍 Search chats..." />
        </div>
        <ul className="chat-list">
          {['Alice', 'Bob', 'Charlie', 'Diana'].map((name) => (
            <li key={name} className="chat-item">
              <div className="avatar">{name[0]}</div>
              <div className="chat-info">
                <span className="chat-name">{name}</span>
                <span className="chat-preview">Hey, how are you?</span>
              </div>
              <div className="online-dot"></div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="chat-area">
        <div className="chat-header">
          <div className="avatar">A</div>
          <div>
            <h3>Alice</h3>
            <span className="status">Online</span>
          </div>
        </div>
        <div className="messages">
          <div className="message received">Hey! How are you? 👋</div>
          <div className="message sent">I'm good, thanks!</div>
        </div>
        <div className="message-input">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </main>
    </div>
  )
}

export default Home