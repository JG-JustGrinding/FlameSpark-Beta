"use client";
import { useState } from "react";
import gsap from "gsap";
import "@/styles/LandingPage.css";
import usePageScroller from "@/lib/usePageScroller";

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { containerRef, scrollToPage } = usePageScroller({
    numPages: 4,
    setCurrentIndex,
    onEnter: (i) => console.log("Entered page", i),
    onLeave: (i) => console.log("Exited page", i),
  });

  return (
    <div className="landing-wrapper">
      {/* Buttons to test programmatic scroll */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999 }}>
        <button onClick={() => scrollToPage(0)}>1</button>
        <button onClick={() => scrollToPage(1)}>2</button>
        <button onClick={() => scrollToPage(2)}>3</button>
        <button onClick={() => scrollToPage(3)}>4</button>
      </div>

      <div className="viewport">
        <div className="slides" ref={containerRef}>
          <section className="slide slide-1">Slide 1</section>
          <section className="slide slide-2">Slide 2</section>
          <section className="slide slide-3">Slide 3</section>
          <section className="slide slide-4">Slide 4</section>
        </div>
      </div>
    </div>
  );
}