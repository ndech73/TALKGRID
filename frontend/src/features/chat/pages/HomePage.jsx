import { useState, useEffect } from "react";
import TopBar from "../../../shared/components/TopBar";
import SearchBar from "../../../shared/components/SearchBar";
import StoryRail from "../../stories/components/StoryRail";
import ChatList from "../components/ChatList";
import BottomNav from "../../../shared/components/BottomNav";
import AiAgentButton from "../components/AiAgentButton";
import AiAgentPanel from "../components/AiAgentPanel";
import Loading from "../../../shared/components/Loading";
import { useAuth } from "../../../shared/hooks/useAuth";
import chatService from "../services/chatService";
import storyService from "../../stories/services/storyService";
import "../styles/HomePage.css";

function Home() {
  const { user } = useAuth();

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
          chatService.getChats(),
          storyService.getStories(),
        ]);

        if (isMounted) {
          setChats(chatData);
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
        user={user}
        rightSlot={<AiAgentButton onClick={() => setIsAiPanelOpen(true)} />}
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