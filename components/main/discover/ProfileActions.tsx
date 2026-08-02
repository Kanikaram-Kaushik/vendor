"use client";

import { useEngagements } from "@/hooks/useEngagements";

type ProfileActionsProps = {
  profileId: string;
};

export default function ProfileActions({ profileId }: ProfileActionsProps) {
  const { follows, savedItems, toggleFollow, toggleSave } = useEngagements();
  const isFollowing = follows.some((item) => item.profileId === profileId);
  const isSaved = savedItems.some(
    (item) => item.itemType === "professional" && item.itemId === profileId
  );

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isFollowing
            ? "border-transparent bg-white text-[#1f1a16] shadow-[0_10px_25px_rgba(15,10,5,0.25)]"
            : "border-white/40 bg-white/10 text-white hover:bg-white/20"
        }`}
        onClick={() => toggleFollow(profileId)}
        aria-label={isFollowing ? "Unfollow studio" : "Follow studio"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isFollowing ? (
            <>
              <path d="M9 12.5l2 2 4-4" />
              <path d="M16 19h-8a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" />
            </>
          ) : (
            <>
              <path d="M12 6v8" />
              <path d="M8 10h8" />
              <path d="M16 19h-8a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" />
            </>
          )}
        </svg>
      </button>
      <button
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isSaved
            ? "border-transparent bg-accent text-white shadow-[0_10px_25px_rgba(15,10,5,0.25)]"
            : "border-white/40 bg-white/10 text-white hover:bg-white/20"
        }`}
        onClick={() => toggleSave("professional", profileId)}
        aria-label={isSaved ? "Remove from saved" : "Save studio"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
        </svg>
      </button>
    </div>
  );
}
