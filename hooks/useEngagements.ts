"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";

export type SavedItem = {
  itemType: "inspiration" | "professional";
  itemId: string;
};

export type LikeItem = {
  itemType: "inspiration" | "professional";
  itemId: string;
};

export type Follow = {
  profileId: string;
};

export type CommentItem = {
  id: string;
  userId: string;
  targetType: "professional" | "inspiration";
  targetId: string;
  content: string;
  rating: number;
  createdAt: string;
};

type EngagementCounts = {
  likes: number;
  saves: number;
  follows: number;
  comments: number;
};

type EngagementStore = {
  savedItems: SavedItem[];
  follows: Follow[];
  comments: CommentItem[];
  likes: LikeItem[];
  counts: EngagementCounts;
};

type AccountResponse = {
  counts: EngagementCounts;
  likes: { targetType: string; targetId: string }[];
  saves: { targetType: string; targetId: string }[];
  follows: Follow[];
  comments: CommentItem[];
};

const defaultStore: EngagementStore = {
  savedItems: [],
  follows: [],
  comments: [],
  likes: [],
  counts: {
    likes: 0,
    saves: 0,
    follows: 0,
    comments: 0,
  },
};

const defaultAccount: AccountResponse = {
  counts: defaultStore.counts,
  likes: [],
  saves: [],
  follows: [],
  comments: [],
};

const fetchJSON = async <T,>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
};

export function useEngagements() {
  const { isLoggedIn, isReady, openModal } = useAuth();
  const queryClient = useQueryClient();

  const { data: accountData = defaultAccount } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      if (!isLoggedIn) return defaultAccount;
      return fetchJSON<AccountResponse>("/api/account");
    },
    enabled: isReady && isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const comments = accountData.comments ?? defaultStore.comments;
  const likes = (accountData.likes ?? []).map((item) => ({
    itemType: item.targetType as LikeItem["itemType"],
    itemId: item.targetId,
  }));
  const savedItems = (accountData.saves ?? []).map((item) => ({
    itemType: item.targetType as SavedItem["itemType"],
    itemId: item.targetId,
  }));
  const follows = accountData.follows ?? defaultStore.follows;
  const counts = accountData.counts ?? defaultStore.counts;

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!isLoggedIn) {
        openModal();
        return;
      }
      action();
    },
    [isLoggedIn, openModal]
  );

  const toggleSaveMutation = useMutation({
    mutationFn: async (payload: {
      itemType: SavedItem["itemType"];
      itemId: string;
      action: "create" | "delete";
    }) => {
      return fetchJSON("/api/account/save", {
        method: "PATCH",
        body: JSON.stringify({
          targetType: payload.itemType,
          targetId: payload.itemId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (payload: {
      itemType: LikeItem["itemType"];
      itemId: string;
      action: "create" | "delete";
    }) => {
      return fetchJSON("/api/account/likes", {
        method: "PATCH",
        body: JSON.stringify({
          targetType: payload.itemType,
          targetId: payload.itemId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async (payload: { profileId: string; action: "create" | "delete" }) => {
      return fetchJSON("/api/account/following", {
        method: "PATCH",
        body: JSON.stringify({ profileId: payload.profileId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (payload: {
      targetType: CommentItem["targetType"];
      targetId: string;
      content: string;
      rating: number;
    }) => {
      return fetchJSON("/api/account/comments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.targetType, variables.targetId],
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async (payload: { id: string; content: string; rating: number }) => {
      return fetchJSON("/api/account/comments", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (payload: { id: string }) => {
      return fetchJSON("/api/account/comments", {
        method: "PATCH",
        body: JSON.stringify({ id: payload.id, action: "delete" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const toggleSave = useCallback(
    (itemType: SavedItem["itemType"], itemId: string) => {
      requireAuth(() => {
        const exists = savedItems.some(
          (item) => item.itemType === itemType && item.itemId === itemId
        );
        toggleSaveMutation.mutate({
          itemType,
          itemId,
          action: exists ? "delete" : "create",
        });
      });
    },
    [requireAuth, savedItems, toggleSaveMutation]
  );

  const toggleLike = useCallback(
    (itemType: LikeItem["itemType"], itemId: string) => {
      requireAuth(() => {
        const exists = likes.some(
          (item) => item.itemType === itemType && item.itemId === itemId
        );
        toggleLikeMutation.mutate({
          itemType,
          itemId,
          action: exists ? "delete" : "create",
        });
      });
    },
    [requireAuth, likes, toggleLikeMutation]
  );

  const toggleFollow = useCallback(
    (profileId: string) => {
      requireAuth(() => {
        const exists = follows.some((item) => item.profileId === profileId);
        toggleFollowMutation.mutate({
          profileId,
          action: exists ? "delete" : "create",
        });
      });
    },
    [requireAuth, follows, toggleFollowMutation]
  );

  const addComment = useCallback(
    (
      targetType: CommentItem["targetType"],
      targetId: string,
      content: string,
      rating: number
    ) => {
      requireAuth(() => {
        addCommentMutation.mutate({ targetType, targetId, content, rating });
      });
    },
    [addCommentMutation, requireAuth]
  );

  const updateComment = useCallback(
    (id: string, content: string, rating: number) => {
      requireAuth(() => {
        updateCommentMutation.mutate({ id, content, rating });
      });
    },
    [requireAuth, updateCommentMutation]
  );

  const deleteComment = useCallback(
    (id: string) => {
      requireAuth(() => {
        deleteCommentMutation.mutate({ id });
      });
    },
    [deleteCommentMutation, requireAuth]
  );

  return useMemo(
    () => ({
      isSignedIn: isLoggedIn,
      savedItems,
      follows,
      comments,
      likes,
      counts,
      toggleSave,
      toggleFollow,
      toggleLike,
      addComment,
      updateComment,
      deleteComment,
      requireAuth,
    }),
    [
      isLoggedIn,
      savedItems,
      follows,
      comments,
      likes,
      counts,
      toggleSave,
      toggleFollow,
      toggleLike,
      addComment,
      updateComment,
      deleteComment,
      requireAuth,
    ]
  );
}
