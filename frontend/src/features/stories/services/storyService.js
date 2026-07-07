// Mock story data — replace with real axios calls once backend is ready
const mockStories = [
  {
    id: "1",
    userName: "Alice Kariuki",
    avatarUrl: null,
    hasUnseenStory: true,
    timestamp: "2026-07-06T08:00:00Z",
  },
  {
    id: "2",
    userName: "Brian Otieno",
    avatarUrl: null,
    hasUnseenStory: true,
    timestamp: "2026-07-06T07:30:00Z",
  },
  {
    id: "3",
    userName: "Triad Dev Group",
    avatarUrl: null,
    hasUnseenStory: false,
    timestamp: "2026-07-05T20:00:00Z",
  },
];

const storyService = {
  async getStories() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStories;
  },
};

export default storyService;