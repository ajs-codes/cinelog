import {
  BookmarkPlus,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReactionButton } from "@/components/title-detail/hero-header/reaction_button";

type ActionBarProps = {
  id?: number;
  imdbId?: string | null;
  language?: string;
};

export function ActionBar({ id, imdbId, language }: ActionBarProps) {
  const tmdbId = id !== undefined ? id : "N/A";
  const displayImdbId = imdbId ?? "N/A";
  const displayLanguage = language ?? "N/A";

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="darkFilled"
          className="h-10 gap-2 rounded-lg border border-white/10 bg-surface-container px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high"
        >
          <BookmarkPlus className="h-4 w-4" />
          Add to Vault
        </Button>

        <button
          type="button"
          aria-label="Share title"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-container text-slate-200 transition hover:bg-surface-container-high"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/15" />

        <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-container/70 p-1.5">
          <ReactionButton
            icon={ThumbsDown}
            label="Dislike"
            className="text-on-surface"
          />
          <ReactionButton
            icon={ThumbsUp}
            label="Like"
            className="text-on-surface"
          />
          <ReactionButton
            icon={Heart}
            iconClassName="fill-status-error text-status-error"
            label="Love"
            active
            className="text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-neutral">
        <span>TMDB ID: {tmdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>IMDB ID: {displayImdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>Language: {displayLanguage}</span>
      </div>
    </div>
  );
}

export default ActionBar;
