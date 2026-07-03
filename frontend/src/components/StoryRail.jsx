import StoryAvatar from '../StoryAvatar';
import './StoryRail.css';

const StoryRail = ({ stories = [], onAddStory, onViewStory }) => (
  <aside className="story-rail">
    <StoryAvatar isOwn name="Add" onClick={onAddStory} />
    {stories.map((story) => (
      <StoryAvatar
        key={story.id}
        src={story.avatar}
        name={story.name}
        hasUnread={story.hasUnread}
        onClick={() => onViewStory?.(story)}
      />
    ))}
  </aside>
);

export default StoryRail;