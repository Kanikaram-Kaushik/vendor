"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEngagements } from "@/hooks/useEngagements";
import { useComments } from "@/hooks/useComments";
import type { ApiComment } from "@/hooks/useComments";

type ReviewsAndCommentsProps = {
  reviews: ApiComment[];
  targetId: string;
};

export default function ReviewsAndComments({
  reviews,
  targetId,
}: ReviewsAndCommentsProps) {
  const { user } = useAuth();
  const {
    comments: myComments,
    addComment,
    updateComment,
    deleteComment,
    requireAuth,
    isSignedIn,
  } = useEngagements();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: comments = [] } = useComments("professional", targetId);

  const myCommentIds = useMemo(
    () => new Set(myComments.map((comment) => comment.id)),
    [myComments]
  );

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    );
  }, [reviews]);

  return (
    <section className="grid gap-8 rounded-[36px] border border-foreground/10 bg-gradient-to-br from-[#1c1713] via-[#191512] to-[#14110f] p-6 text-[#f8f4ef] sm:gap-10 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#cdbeb3]">
            Reviews
          </p>
          <div className="mt-4 flex items-end gap-4">
            <h3 className="text-4xl font-semibold">{average.toFixed(1)}</h3>
            <p className="text-sm text-[#cdbeb3]">/ 5</p>
          </div>
          <p className="mt-2 text-sm text-[#cdbeb3]">
            {reviews.length} total reviews
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={`${review.userId}-${review.createdAt}-${index}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Member</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#cdbeb3]">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">
                  {review.rating} ★
                </span>
              </div>
              <p className="mt-3 text-sm text-[#e6ded7]">{review.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#cdbeb3]">
            Comments
          </p>
          <h3 className="mt-3 text-2xl font-semibold">Join the conversation</h3>
          <p className="text-sm text-[#cdbeb3]">
            Ask questions, share feedback, or request more details.
          </p>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = myCommentIds.has(comment.id);
            const firstName =
              typeof (user as { firstName?: string })?.firstName === "string"
                ? (user as { firstName?: string }).firstName
                : "";
            const lastName =
              typeof (user as { lastName?: string })?.lastName === "string"
                ? (user as { lastName?: string }).lastName
                : "";
            const fallbackName = user?.name || user?.email || "Member";
            const currentUserName =
              firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : fallbackName;
            const displayName =
              comment.userId === user?.id ? currentUserName : "Member";
            const displayDate = new Date(comment.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            );
            return (
              <div
                key={comment.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#cdbeb3]">
                  <span className="font-semibold text-[#f8f4ef]">
                    {displayName}
                  </span>
                  <span>{displayDate}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#cdbeb3]">
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold">
                    {comment.rating} ★
                  </span>
                </div>
                {editingId === comment.id ? (
                  <textarea
                    rows={3}
                    className="mt-3 w-full rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm text-[#1f1a16] focus:border-[#d6a06c] focus:outline-none"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                ) : (
                  <p className="mt-3 text-sm text-[#e6ded7]">{comment.content}</p>
                )}
                {isOwner ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
                    {editingId === comment.id ? (
                      <>
                        <label className="flex items-center gap-2 text-[#cdbeb3]">
                          Rating
                          <select
                            className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold text-[#f8f4ef]"
                            value={rating}
                            onChange={(event) =>
                              setRating(Number(event.target.value))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          className="text-[#d6a06c]"
                          onClick={() => {
                            if (!text.trim()) return;
                            updateComment(comment.id, text, rating);
                            setEditingId(null);
                            setText("");
                          }}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-[#d6a06c]"
                        onClick={() => {
                          setEditingId(comment.id);
                          setText(comment.content);
                          setRating(comment.rating);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="text-[#cdbeb3]"
                      onClick={() => deleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#cdbeb3]">
            Leave a comment
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cdbeb3]">
              Rating
            </label>
            <select
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8f4ef]"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} ★
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={4}
            className="mt-4 w-full rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm text-[#1f1a16] focus:border-[#d6a06c] focus:outline-none"
            placeholder={
              user
                ? "Share a question or feedback..."
                : "Login to add your comment."
            }
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-[#d6a06c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#20150c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!text.trim()}
              onClick={() => {
                if (!text.trim()) return;
                addComment("professional", targetId, text, rating);
                setText("");
                setRating(5);
              }}
            >
              Post comment
            </button>
            {!user ? (
              <p className="text-xs text-[#cdbeb3]">
                Login via OTP to participate.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
