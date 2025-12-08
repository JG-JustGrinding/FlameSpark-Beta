"use client";

import { useRef, useEffect, useState } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import "@/styles/ExplorePage.css";
import "@/styles/ProjectPost.css";
import "@/styles/Home.css";
import HomePagePost from "@/components/HomePagePost";
import { fetchExplorePagePosts, ratePost } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/lib/useUser";

export default function ExplorePageClient({ initialPosts = [], initialSeed }) {
    const carouselRef = useRef(null);
    const [currentCard, setCurrentCard] = useState(0);
    const [previousCard, setPreviousCard] = useState(0);
    const prevCardIndexRef = useRef();
    const [posts, setPosts] = useState(initialPosts || []);
    const [page, setPage] = useState(initialPosts?.length > 0 ? 1 : 0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false);
    const currentCardRef = useRef(-1);
    const seedRef = useRef(initialSeed ?? (Math.random() * 2 - 1));
    const seed = seedRef.current;
    const { user } = useUser();

    const postBufferRef = useRef([]);
    const BUFFER_THRESHOLD = 3;   // tweak as needed
    const FETCH_SIZE = 5;        // fetch this many at once

    const scrollLeft = () => {
            const carousel = carouselRef.current;
    if (!carousel) return;

      carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
    };

    const scrollRight = () => {
            const carousel = carouselRef.current;
    if (!carousel) return;

      carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
    };

    useEffect(() => {
    // Get previous value
      const prevIndex = prevCardIndexRef.current;

      setPreviousCard(prevIndex);
      
      // Now update the ref to the current value
      prevCardIndexRef.current = currentCard;
  }, [currentCard]);

const fetchPosts = async () => {
  
  if (loading || isLoadingRef.current == true || !hasMore) return;
  setLoading(true);
  isLoadingRef.current = true;

  try {
    const newPosts = await fetchExplorePagePosts(null, page, FETCH_SIZE, seed);
    setPage(prev => prev + 1);

    // update buffer synchronously
    postBufferRef.current = [...postBufferRef.current, ...newPosts];
  } catch (error) {

  } finally {
    setLoading(false);
    isLoadingRef.current = false;
  }
};

// --- consume function ---
const showNextPost = () => {
  if (postBufferRef.current.length === 0) {
    fetchPosts();
    return;
  }

  const [next, ...rest] = postBufferRef.current;
  postBufferRef.current = rest;

  setPosts(prev => [...prev, next]);

  if (rest.length < BUFFER_THRESHOLD) {
    fetchPosts();
  }
};

useEffect(() => {
  // If we already have initial posts from server, prefill buffer and skip extra fetch
  if (initialPosts && initialPosts.length > 0) {
    postBufferRef.current = [...initialPosts];
    showNextPost();
  } else {
    fetchPosts().then(() => {
      if (postBufferRef.current.length > 0) {
        showNextPost();
      }
    });
  }
}, []);

// --- watch card index ---
useEffect(() => {
  // When user scrolls right and reaches the end of "posts",
  // consume the next item from the buffer.
  if (currentCard >= posts.length - 2) {
    showNextPost();
  }
}, [currentCard, posts.length]);

useEffect(() => {
  const carousel = carouselRef.current;
  if (!carousel) return;

  let rafId = null;

  const onScroll = () => {
    // debounce/fuse events into one frame
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const cards = Array.from(carousel.children);
      if (cards.length === 0) return;

      const center = carousel.scrollLeft + carousel.clientWidth / 2;

      // find the closest card index (single pass)
      let closestIndex = 0;
      let closestDistance = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      // only update once if changed
      if (closestIndex !== currentCardRef.current) {
        setCurrentCard(closestIndex);
        currentCardRef.current = closestIndex;
      }

      // update active class
      cards.forEach((card, i) => {
        card.classList.toggle("active", i === closestIndex);
      });
    });
  };

  // initial snap check
  onScroll();

  // attach listener
  carousel.addEventListener("scroll", onScroll, { passive: true });

  // cleanup
  return () => {
    carousel.removeEventListener("scroll", onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}, [posts.length]);

    async function rateProjectPost(post, userId, value)
    {
        try {
            await ratePost(post.post_id, userId, value);
        } catch (err) {
            if (err.notLoggedIn)
            {
                window.location.href = "/login";
            }
        }
    }

    return (
        <PrimaryPageLayout useTitle={false} noContainerPadding={true} title="Explore" description="Encounter new projects by scrolling through posts">
        <div className="carousel-container">
            {currentCard != 0 && <button className="nav left" onClick={scrollLeft}>&#10094;</button>}
            <div className="carousel" ref={carouselRef}>
              {posts.map((post, i) => (
                <div className="card" key={i}>
                  <HomePagePost postId={post.post_id} goToPreview={true} title={post.post_title} description={post.post_description} postContent={post.post_content} projectIcon={post.project_icon} projectName={post.project_title} projectId={post.project_ide || post.project_id} dateCreated={post.post_created_at} rateFunction={rateProjectPost.bind(null, post, user?.id)} currentPostIndex={currentCard} postIndex={i} previousIndex={previousCard}/>
                </div>
              ))}
            </div>
            {(posts.length > 0 && currentCard != posts.length - 1) && <button className="nav right" onClick={scrollRight}>&#10095;</button>}
        </div>
        </PrimaryPageLayout>
    )
}