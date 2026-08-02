"use client";

import { useQuery } from "@tanstack/react-query";

type CommentTargetType = "professional" | "inspiration";

export type ApiComment = {
  id: string;
  userId: string;
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  rating: number;
  createdAt: string;
};

const fetchJSON = async <T,>(input: RequestInfo | URL): Promise<T> => {
  const res = await fetch(input);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
};

export function useComments(targetType: CommentTargetType, targetId: string) {
  return useQuery({
    queryKey: ["comments", targetType, targetId],
    queryFn: async () => {
      const data = await fetchJSON<{ comments: ApiComment[] }>(
        `/api/comments?targetType=${encodeURIComponent(
          targetType
        )}&targetId=${encodeURIComponent(targetId)}`
      );
      return data.comments;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
