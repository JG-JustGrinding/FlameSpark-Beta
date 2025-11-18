"use client";
import { useEffect, useState } from "react";
import { getAnonId } from "@/lib/getAnonID.js";

export function useBlogLike(blogId) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [loading, setLoading] = useState(true);

    const [anonId, setAnonId] = useState(null);

    useEffect(() => {
        setAnonId(getAnonId());
    }, []);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      const res = await fetch(`/api/blogLike/count?blogId=${blogId}`);
      const data = await res.json();
      setCount(data.count || 0);

      const checkRes = await fetch(`/api/blogLike/check?blogId=${blogId}&anonId=${anonId}`);
      const checkData = await checkRes.json();
      setLiked(checkData.liked || false);
      setLoading(false);
    }
    if (blogId && anonId) {
      fetchStatus();
    }
  }, [blogId, anonId]);

  const like = async () => {
      setLiked(true);
      setCount(c => c + 1); // Optimistic update
      setActionInProgress(true);

    const res = await fetch("/api/blogLike/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, anonId })
    });
    const data = await res.json();

    setActionInProgress(false);
  };

  const unlike = async () => {
    setLiked(false);
    setCount(c => c - 1); // Optimistic update
    setActionInProgress(true);

    const res = await fetch("/api/blogLike/unlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, anonId })
    });
    const data = await res.json();

    setActionInProgress(false);
  };

  return { liked, count, like, unlike, actionInProgress, loading };
}
