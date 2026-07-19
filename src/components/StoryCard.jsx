import { Link } from "react-router-dom";
import ImageSlot from "./ImageSlot";
import { useApp } from "../context/AppContext";
import { bucketForAgeRange } from "../utils/ageBuckets";

export default function StoryCard({ story }) {
  const { state, actions } = useApp();
  const isFav = state.favorites.includes(story.id);
  const progress = state.readingHistory.find((h) => h.storyId === story.id);

  return (
    <div className="group bg-white rounded-xl2 overflow-hidden shadow-card border border-rawaa-gray/60">
      <Link to={`/story/${story.id}`} className="block relative">
        <ImageSlot
          url={story.cover?.imageUrl}
          basePath={`/images/stories/${story.id}/cover`}
          prompt={story.cover?.imagePrompt}
          ratio="aspect-[4/3]"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            actions.toggleFavorite(story.id);
          }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-rawaa-red shadow"
          aria-label="أضف للمفضلة"
        >
          {isFav ? "♥" : "♡"}
        </button>
        {progress && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-rawaa-gray/60">
            <div
              className="h-full bg-rawaa-red"
              style={{ width: `${Math.min(100, (progress.lastPage / (story.pages.length || 1)) * 100)}%` }}
            />
          </div>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-rawaa-teal bg-rawaa-gray/60">
            {bucketForAgeRange(story.ageRange)?.label || story.ageRange}
          </span>
        </div>
        <Link to={`/story/${story.id}`}>
          <h3 className="font-display font-bold text-rawaa-ink mb-1 hover:opacity-70 transition">{story.title}</h3>
        </Link>
        {story.moral && <p className="text-xs text-rawaa-grayDark line-clamp-2">{story.moral}</p>}
      </div>
    </div>
  );
}
