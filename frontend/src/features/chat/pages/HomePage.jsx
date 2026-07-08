import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../shared/components/TopBar";
import SearchBar from "../../../shared/components/SearchBar";
import StoryRail from "../../stories/components/StoryRail";
import ChatList from "../components/ChatList";
import BottomNav from "../../../shared/components/BottomNav";
import AiAgentPanel from "../components/AiAgentPanel";
import Loading from "../../../shared/components/Loading";
import { useAuth } from "../../../shared/hooks/useAuth";
import chatService from "../services/chatService";
import storyService from "../../stories/services/storyService";
import "../styles/HomePage.css";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [chatData, storyData] = await Promise.all([
          chatService.getConversations(),
          storyService.getStories(),
        ]);

        const normalizedChats = Array.isArray(chatData)
          ? chatData
          : chatData?.conversations || [];

        if (isMounted) {
          setChats(normalizedChats);
          setStories(storyData);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredChats = chats.filter((chat) =>
    (chat?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="home-loading">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <p>Couldn't load your chats. Check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-glow home-glow--top" />
      <div className="home-glow home-glow--bottom" />

      <TopBar
        title="Triad"
        onAIAgent={() => setIsAiPanelOpen(true)}
        actions={[
          {
            label: "Settings",
            onClick: () => navigate("/settings"),
            icon: (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009.09 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
          },
        ]}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search chats"
      />

      <div className="home-content">
        <div className="home-main">
          <ChatList chats={filteredChats} />
        </div>

        <StoryRail stories={stories} />
      </div>

      <BottomNav active="home" />

      {isAiPanelOpen && (
        <AiAgentPanel onClose={() => setIsAiPanelOpen(false)} />
      )}
    </div>
  );
}

export default Home;