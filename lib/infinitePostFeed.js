import { useEffect, useState, useRef, useCallback, use } from "react";
import { useInView } from "react-intersection-observer";
import { fetchPosts } from "@/lib/projectFunctions";
import { faL } from "@fortawesome/free-solid-svg-icons";


export function InfiniteProjectPostScroll({ fetchPage, projectId, renderItem, limit = 10, filter, noneFoundMessage = "No posts found." }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [itemsSet, setItemsSet] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();
    const didRun = useRef(false);
    const lastPageRef = useRef(-1);

  useEffect(() => {
    const load = async () => {
        if (didRun.current){
            return;
        }
        
        if (loading || !hasMore) return;

        //didRun.current = true;
        setLoading(true);
        const newItems = await fetchPage(projectId, page, limit, filter);
        setItemsSet(true);
        setLoading(false);
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);

        if (newItems.length < limit) {
            setHasMore(false);
        }
      } else {
        setHasMore(false);
      }

        lastPageRef.current = currentPage;
    };
    load();
  }, [page]);

    useEffect(() => {
        setItems([]);
        setPage(0);
        setHasMore(true);
        setItemsSet(false);
        setLoading(false);
        didRun.current = false;
    }, [filter]);

    useEffect(() => {
        if (inView && hasMore && !loading && !didRun.current && !resetting) {
            setPage(prev => prev + 1);
        }
    }, [inView, hasMore]);

    useEffect(() => {
        didRun.current = false;
    }, [projectId]);

  return (
    <>
    {(itemsSet && items?.length == 0) && <span className="bodyFont bold no-posts-text">{noneFoundMessage}</span>}

      {items.map((item, idx) => (
        renderItem(item, idx)
      ))}

      {/* Sentinel */}
      {(hasMore && itemsSet) && (
        <div ref={ref} className="bodyFont" style={{ padding: "20px", textAlign: "center" }}>
          {inView ? "Loading More..." : ""}
        </div>
      )}
    </>
  );
}

export function Paginator({ fetchFunction, projectId, renderItem, limit = 10, filter, updateNoItems, updateItemCount, noneFoundMessage = "None found.", noMoreObject, updateItem }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [itemsSet, setItemsSet] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [resetting, setResetting] = useState(false);
    const { ref, inView } = useInView();
    const lastPageRef = useRef(-1);
    const highCount = useRef(0);
    const isLoadingRef = useRef(false);

    const fetchMore = async (fetchPage = -1, overrideHasMore = false) => {
        if (loading || isLoadingRef.current == true || (!hasMore && !overrideHasMore)) 
        {
            return;
        }
        
        const currentPage = fetchPage === -1 ? page : fetchPage;
        
        if (currentPage === lastPageRef.current) {
            //return;
        }
        
        let more = hasMore;

        setLoading(true);
        
        isLoadingRef.current = true;
        const newItems = await fetchFunction(projectId, currentPage, limit, filter);
        isLoadingRef.current = false;
        setLoading(false);
        setItemsSet(true);

      if (newItems?.length > 0) {
        if (updateItemCount && highCount.current == 0)
        {
          let count = newItems.length;

          updateItemCount(`${count}${count > limit - 1 ? "+" : ""}`);

          highCount.current = count;
        }

        setItems(prev => [...prev, ...newItems]);

        if (newItems?.length < limit) {
            setHasMore(false);
            more = false;
        }
        
        if (updateNoItems)
        {
          updateNoItems(false);
        }
      } else {
        setHasMore(false);
        more = false;

        if (page == 0 && updateNoItems) {
          updateNoItems(true);
        }
      }

        lastPageRef.current = currentPage;
        setPage(prev => prev + 1);
    };

    useEffect(() => {
      if (inView)
      {
        fetchMore();
      }
    }, [page]);

    /*
    useEffect(() => {
      if (inView)
      {
        fetchMore();
      }
    }, [items]);
    */

    const checkScroll = (page, more) => {
        if (loading || !hasMore || !more) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 50) {
            fetchMore(page);
        }
    }

    function reset() {
        lastPageRef.current = -1;
        highCount.current = 0;
        setItems([]);
        if (page !== 0)
        {
            setPage(0);
        } else {
            fetchMore(0, true);
        }
        setHasMore(true);
        setItemsSet(false);
        setLoading(false);

        if (updateNoItems)
        {
          updateNoItems(false);
        }

        if (updateItemCount)
        {
          updateItemCount("0");
        }
    }

    useEffect(() => {
        if (inView && hasMore && !loading && !resetting) {
            //fetchMore();
            setPage(prev => prev + 1);
        }
    }, [inView]);

    useEffect(() => {
        reset();
        fetchMore(0, true);
    }, [filter]);

    useEffect(() => {
      if (!updateItem)
      {
        return;
      }

      console.log(updateItem);

      setItems(prev =>
        prev
          .map(p => (p.id === updateItem.id ? updateItem : p))
          /*.sort((a, b) => {
            // pinned first (project posts only)
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            if (a.is_pinned && b.is_pinned) return new Date(b.pinned_at) - new Date(a.pinned_at);
            return new Date(a.created_at) - new Date(b.created_at);
          })*/
      );
    }, [updateItem])

    return (
    <>
    {(itemsSet && items?.length == 0) && <span className="bodyFont bold no-posts-text">{noneFoundMessage}</span>}

        {items.map((item, idx) => (
        renderItem(item, idx)
        ))}

        {/* Sentinel */}
        {(hasMore && itemsSet) && (
        <div ref={ref} className="bodyFont paginator-load-more" style={{ padding: "20px", textAlign: "center" }}>
            {inView ? "Loading More..." : ""}
        </div>
        )}

        {(!hasMore && noMoreObject) && (
          <>
          {noMoreObject}
          </>
        )}
    </>
    );
}
