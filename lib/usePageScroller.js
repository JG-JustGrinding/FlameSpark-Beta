"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function usePageScroller({
  numPages,
  onEnter,
  onLeave,
  setCurrentIndex
}) {
  const currentIndex = useRef(0);
  const isScrolling = useRef(false);
  const containerRef = useRef(null);

  const scrollToPage = (index) => {
    if (index < 0 || index >= numPages) return;

    if (onLeave) onLeave(currentIndex.current);
    isScrolling.current = true;

    gsap.to(containerRef.current, {
      y: -index * window.innerHeight,
      duration: .78,
      ease: "power3.inOut",
      onComplete: () => {
        currentIndex.current = index;
        if (setCurrentIndex) setCurrentIndex(index);
        if (onEnter) onEnter(index);
        isScrolling.current = false;
      },
    });
  };

  useEffect(() => {
    const handleWheel = (e) => {
      // Prevent zoom-triggered scroll
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      if (isScrolling.current) return;

      if (e.deltaY > 0) scrollToPage(currentIndex.current + 1);
      if (e.deltaY < 0) scrollToPage(currentIndex.current - 1);
    };

    const handleKey = (e) => {
      if (isScrolling.current) return;

      if (["ArrowDown", "PageDown", " ", "s", "S"].includes(e.key))
        scrollToPage(currentIndex.current + 1);

      if (["ArrowUp", "PageUp", "w", "W"].includes(e.key))
        scrollToPage(currentIndex.current - 1);
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (isScrolling.current) return;
      const diff = touchStartY - e.touches[0].clientY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) scrollToPage(currentIndex.current + 1);
        else scrollToPage(currentIndex.current - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (onEnter) onEnter(0);
  }, []);

useEffect(() => {
  let resizeTimeout;

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      gsap.set(containerRef.current, {
        y: -currentIndex.current * window.innerHeight,
      });
    }, 50);
  };

  const handleOrientation = () => {
    setTimeout(() => {
      gsap.set(containerRef.current, {
        y: -currentIndex.current * window.innerHeight,
      });
    }, 300); // give mobile rotation time to settle
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleOrientation);

  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleOrientation);
  };
}, []);

  return { containerRef, scrollToPage };
}
