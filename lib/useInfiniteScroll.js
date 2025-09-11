import { useState, useEffect, useRef, useCallback } from "react";

export function useInfiniteScroll(fetchFunction, pageSize = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; }
  }, []);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const newData = await fetchFunction(page, pageSize);

    if (!isMounted.current) return;

    if (!newData || newData.length < pageSize) {
      setHasMore(false);
    }

    setData(prev => [...prev, ...newData]);
    setPage(prev => prev + 1);
    setLoading(false);
  }, [fetchFunction, page, pageSize, loading, hasMore]);

  useEffect(() => {
    fetchData(); // initial load
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 // buffer of 300px
      ) {
        fetchData();
      }
    };

    const debounce = (func, delay = 200) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
      };
    };

    const debouncedScroll = debounce(handleScroll, 200);

    window.addEventListener("scroll", debouncedScroll);
    return () => window.removeEventListener("scroll", debouncedScroll);
  }, [fetchData]);

  return { data, loading, hasMore, fetchData };
}
