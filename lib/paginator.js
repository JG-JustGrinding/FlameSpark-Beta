import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

export function Paginator({
  items = [],                // Controlled items
  page,                      // Controlled page number
  setPage,                   // Callback to change page
  hasMore = true,            // Controlled hasMore
  setHasMore,                // Callback to update hasMore
  loading = false,           // Controlled loading
  setLoading,                // Callback to update loading
  fetchFunction,             // Async function returning next items
  renderItem,
  noneFoundMessage = "None found.",
  noneFoundObject = null,
  noMoreObject = null
}) {
  const { ref, inView } = useInView();
  const isLoadingRef = useRef(false);

  const fetchMore = async () => {
    if (!fetchFunction || loading || isLoadingRef.current || !hasMore) return;

    setLoading(true);
    isLoadingRef.current = true;

    const newItems = await fetchFunction(page); // parent decides signature

    isLoadingRef.current = false;
    setLoading(false);

    if (!newItems || newItems.length === 0) {
      setHasMore(false);
      return;
    }

    // Parent must update items in its state
  };

  // Trigger next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(page + 1);
    }
  }, [inView]);

  // Fetch when page changes
  useEffect(() => {
    fetchMore();
  }, [page]);

  return (
    <>
      {items.length === 0 && !loading && !hasMore && (
        <>{noneFoundObject || <span className="bodyFont bold no-posts-text">{noneFoundMessage}</span>}</>
      )}

      {items.map((item, idx) => renderItem(item, idx))}

      {hasMore && (
        <div ref={ref} className="bodyFont paginator-load-more" style={{ padding: "20px", textAlign: "center" }}>
          {loading ? (
            <span
              className="paginator-spinner"
              aria-label="Loading"
              role="status"
              style={{
                display: "inline-block",
                width: 30,
                height: 30,
                border: "3px solid var(--shadow, #ccc)",
                borderTopColor: "var(--flamespark-red)",
                borderRadius: "50%",
                animation: "paginatorSpin 0.8s linear infinite",
              }}
            />
          ) : ""}
          <style>{`
            @keyframes paginatorSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {!hasMore && noMoreObject && <>{noMoreObject}</>}
    </>
  );
}
