import { customFetch } from "@workspace/api-client-react";
import { useCallback, useEffect, useState } from "react";

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  text: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    avatarUrl?: string | null;
    organization?: string | null;
  };
}

interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export function useLike(
  postId: number,
  initialLiked: boolean,
  initialCount: number,
) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  const toggle = useCallback(async () => {
    if (isToggling) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setIsToggling(true);
    try {
      const res = await customFetch<LikeResponse>(
        `/api/reports/${postId}/likes`,
        { method: "POST" },
      );
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, liked, likeCount, postId]);

  return { liked, likeCount, toggle, isToggling };
}

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await customFetch<Comment[]>(
        `/api/reports/${postId}/comments`,
      );
      setComments(data ?? []);
    } catch {
      setFetchError("Could not load comments. Tap to retry.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim() || isPosting) return false;
      setIsPosting(true);
      try {
        const comment = await customFetch<Comment>(
          `/api/reports/${postId}/comments`,
          {
            method: "POST",
            body: JSON.stringify({ text: text.trim() }),
          },
        );
        setComments((prev) => [...prev, comment]);
        return true;
      } catch {
        return false;
      } finally {
        setIsPosting(false);
      }
    },
    [isPosting, postId],
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      try {
        await customFetch(`/api/comments/${commentId}`, { method: "DELETE" });
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return { comments, isLoading, isPosting, fetchError, postComment, deleteComment, refetch: fetchComments };
}
