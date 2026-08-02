"use client";

import { useEngagements } from "@/hooks/useEngagements";

type InspirationEngagementProps = {
  slug: string;
};

export default function InspirationEngagement({
  slug,
}: InspirationEngagementProps) {
  const { likes, savedItems, toggleLike, toggleSave } = useEngagements();
  const isLiked = likes.some(
    (item) => item.itemType === "inspiration" && item.itemId === slug
  );
  const isSaved = savedItems.some(
    (item) => item.itemType === "inspiration" && item.itemId === slug
  );

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isLiked
            ? "border-transparent bg-accent text-white shadow-[0_10px_25px_rgba(15,10,5,0.25)]"
            : "border-white/40 bg-white/10 text-white hover:bg-white/20"
        }`}
        onClick={() => toggleLike("inspiration", slug)}
        aria-label={isLiked ? "Unlike inspiration" : "Like inspiration"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        </svg>
      </button>
      <button
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isSaved
            ? "border-transparent bg-white text-[#1f1a16] shadow-[0_10px_25px_rgba(15,10,5,0.25)]"
            : "border-white/40 bg-white/10 text-white hover:bg-white/20"
        }`}
        onClick={() => toggleSave("inspiration", slug)}
        aria-label={isSaved ? "Remove from saved" : "Save inspiration"}
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
