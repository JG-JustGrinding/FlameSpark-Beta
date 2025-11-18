"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "@/styles/LandingPage.css";
import LandingPageSlideLayout from "@/components/LandingPageSlideLayout";
import "@/components/LandingPageSlideLayouts.css";
import usePageScroller from "@/lib/usePageScroller";
import Image from "next/image";

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slide2Index, setSlide2Index] = useState(0);
  const [slide2CarouselIndex, setSlide2CarouselIndex] = useState(0);
  const [slide2CarouselDone, setSlide2CarouselDone] = useState(false);
  const carouselTimelineRef = useRef(null);
  const carouselIndexRef = useRef(0);
  const hasSkippedRef = useRef(false);
  const messages = [
    "Most ideas never get even a chance to shine.",
    "Even the most amazing ideas can be overshadowed by more popular trends before they can be made into a complete creation.",
    "Creators hesitate to share early concepts, fearing they'll be buried instantly.",
    "FlameSpark exists to give raw, early-stage ideas a real runway." // last stays visible
  ];

  // Build GSAP carousel when entering slide2Index === 1
  useEffect(() => {
    if (slide2Index !== 1) {
      // cleanup if leaving
      if (carouselTimelineRef.current) {
        carouselTimelineRef.current.kill();
        carouselTimelineRef.current = null;
      }
      setSlide2CarouselIndex(0);
      carouselIndexRef.current = 0;
      setSlide2CarouselDone(false);
      return;
    }

    // Wait for DOM
    requestAnimationFrame(() => {
      const items = gsap.utils.toArray('.text-carousel .carousel-item');
      if (!items.length) return;

      // Reset states
      gsap.set(items, { opacity: 0 });
      setSlide2CarouselIndex(0);
      carouselIndexRef.current = 0;
      hasSkippedRef.current = false;
      setSlide2CarouselDone(false);

      const tl = gsap.timeline({ paused: false });
      carouselTimelineRef.current = tl;

      items.forEach((el, i) => {
        // For last item, keep it visible and set done
        tl.addLabel(`item-${i}-in`);
        tl.call(() => { 
          setSlide2CarouselIndex(i); 
          carouselIndexRef.current = i;
          hasSkippedRef.current = false; // Reset skip flag for new item
        });
        tl.to(el, { opacity: 1, duration: 1.0, ease: 'power2.out' });
        if (i < items.length - 1) {
          // hold, then mark fade-out start label, then fade out
          tl.to({}, { duration: 2.6 });
          tl.addLabel(`item-${i}-out`);
          tl.to(el, { opacity: 0, duration: 1.2, ease: 'power2.in' });
        } else {
          // last stays; mark done after a short hold
          tl.to({}, { duration: 2.0 });
          tl.call(() => setSlide2CarouselDone(true));
        }
      });
    });
  }, [slide2Index]);

  // Click handler to speed progression
  const speedUpCarousel = () => {
    if (!carouselTimelineRef.current) return;
    const tl = carouselTimelineRef.current;
    const currentIdx = carouselIndexRef.current;
    
    // If we're on the last item or already done, do nothing
    if (currentIdx >= messages.length - 1 || slide2CarouselDone) return;
    
    // If we've already skipped this item, don't skip again
    if (hasSkippedRef.current) return;
    
    // Jump to the fade-out label of the current item
    const fadeOutLabel = `item-${currentIdx}-out`;
    if (tl.labels[fadeOutLabel] !== undefined) {
      hasSkippedRef.current = true;
      tl.seek(fadeOutLabel);
    }
  };

  const goToNextMessage = () => {
    if (!carouselTimelineRef.current) return;
    const tl = carouselTimelineRef.current;
    const currentIdx = carouselIndexRef.current;
    
    // If we're on the last item, do nothing
    if (currentIdx >= messages.length - 1) return;
    
    // Jump to the next item's fade-in label
    const nextIdx = currentIdx + 1;
    const nextLabel = `item-${nextIdx}-in`;
    if (tl.labels[nextLabel] !== undefined) {
      tl.seek(nextLabel);
    }
  };

  const goToPrevMessage = () => {
    if (!carouselTimelineRef.current) return;
    const tl = carouselTimelineRef.current;
    const currentIdx = carouselIndexRef.current;
    
    // If we're on the first item, do nothing
    if (currentIdx <= 0) return;
    
    // Jump to the previous item's fade-in label
    const prevIdx = currentIdx - 1;
    const prevLabel = `item-${prevIdx}-in`;
    if (tl.labels[prevLabel] !== undefined) {
      tl.seek(prevLabel);
    }
  };

  const { containerRef, scrollToPage } = usePageScroller({
    numPages: 4,
    setCurrentIndex,
    onEnter: (i) => console.log("Entered page", i),
    onLeave: (i) => console.log("Exited page", i),
  });

  const startSlide2CarouselFade = () => {
    gsap.to(".text-carousel .carousel-item", {
      opacity: 1,
      duration: 1,
      stagger: 0.2,
    });
  };

  return (
    <div className="landing-wrapper">
      {/* Landing sticky header overlay */}
      <header className="landing-header" role="banner">
        <div className="inner">
          <a className="logo" href="/" aria-label="FlameSpark home">
            <img src="/logo_NoPadding_Transparent.png" alt="FlameSpark logo" />
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="/blogs" className="bodyFont">Blogs</a>
            <a href="/" className="bodyFont">Discover</a>
            <a href="/explore" className="bodyFont">Explore</a>
          </nav>
          <div className="cta">
            <a href="/signup" className="button-shape red-color bodyFont" aria-label="Sign up">Become a Beta Tester</a>
          </div>
        </div>
      </header>
      {/* Buttons to test programmatic scroll */}
      <div style={{ position: "fixed", top: 80, right: 20, zIndex: 999 }}>
        <button onClick={() => scrollToPage(0)}>1</button>
        <button onClick={() => scrollToPage(1)}>2</button>
        <button onClick={() => scrollToPage(2)}>3</button>
        <button onClick={() => scrollToPage(3)}>4</button>
      </div>

      <div className="viewport">
        <div className="slides" ref={containerRef}>
          <section className="slide slide-1">
            <div className="content">
              <Image src="/logo_no_text.png" alt="FlameSpark Logo" width={200} height={200} />
              <h1 className="flameSparkFont">Where <span style={{ color: "var(--flamespark-red)" }}>anyone</span> can let their ideas <span className="glow">shine</span></h1>
              <p className="bodyFont bold">How FlameSpark empowers ideas rather than crushing them.</p>
              <div className="continue-container" onClick={() => scrollToPage(1)}>
                <Image src="/chevron-bottom.svg" alt="Scroll Down Arrow" width={70} height={70} />
              </div>
            </div>
          </section>
          <section className="slide slide-2" onClick={goToNextMessage}>
            {slide2Index === 0 && (
              <div className="title-card">
                <h2 className="titleFont">The Problem</h2>
                <button className="bodyFont button-shape red-color full-round" onClick={() => setSlide2Index(1)}>Click to Continue &gt;&gt;</button>
              </div>
            )}
            {slide2Index === 1 && (
              <div className="text-carousel">
                {messages.map((msg, i) => (
                  <div key={i} className={`carousel-item${slide2CarouselIndex === i ? " active" : ""}`}>
                    <p className="bodyFont">{msg}</p>
                  </div>
                ))}
                <div className="carousel-controls">
                  <div className="progress-dots">
                    {messages.map((_, i) => (
                      <span
                        key={i}
                        className={`progress-dot${i < slide2CarouselIndex ? " done" : ""}${i === slide2CarouselIndex ? " active" : ""}`}
                      />
                    ))}
                  </div>
                  {slide2CarouselDone ? (
                    <div className="continue-button-container">
                      <button className="bodyFont button-shape red-color full-round" onClick={() => setSlide2Index(2)}>Click to Continue &gt;&gt;</button>
                    </div>
                  ) : (
                    <p className="bodyFont carousel-hint">(Tap to speed up)</p>
                  )}
                </div>
              </div>
            )}
            
            {slide2Index !== 0 && (
            <span className="bodyFont slide-title-bottom">
              The Problem
            </span>)}
          </section>
          <section className="slide slide-3">Slide 3</section>
          <section className="slide slide-4">Slide 4</section>
        </div>
      </div>
    </div>
  );
}