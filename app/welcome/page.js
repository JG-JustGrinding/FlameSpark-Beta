"use client";
import "@/styles/welcome.css";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WelcomeSection from "@/components/WelcomeSection";

export default function WelcomePage() {
  const sectionsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const isAnimating = useRef(false);
  const suppressObserver = useRef(false);

  const sections = [
    { id: "intro", title: " FlameSpark: A Revolutionary New Platform", text: "How FlameSpark gives everyone a fair chance to shine." },
    { id: "mission", title: "Our Mission", text: "We create amazing experiences." },
    { id: "join", title: "Join Us", text: "Become part of something great." },
  ];

  const searchParams = useSearchParams();

  const scrollToSection = (index) => {
    if (isAnimating.current) return;
    if (index < 0 || index >= sections.length) return;

    // mark that we're animating so other inputs don't try to interrupt
    isAnimating.current = true;
    // temporarily suppress IntersectionObserver-driven updates so intermediate
    // sections that cross the viewport during the smooth scroll don't become
    // the "selected" section.
    suppressObserver.current = true;

    // center the section in the viewport so header overlays it without shifting content
    sectionsRef.current[index]?.scrollIntoView({ behavior: "smooth", block: 'center' });

    // After the expected animation time, clear the suppression and set final state.
    // The timeout should be slightly longer than the CSS transition/scroll duration.
    setTimeout(() => {
      isAnimating.current = false;
      suppressObserver.current = false;
      // ensure the final index is the requested one
      setCurrentIndex(index);
      // update URL without scrolling
      router.replace(`/welcome?page=${index + 1}`, { scroll: false });
    }, 600);
  };

  // Wheel navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isAnimating.current) return;

      if (e.deltaY > 40 && currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      } else if (e.deltaY < -40 && currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex]);

  // Keyboard navigation (W/S + Arrows)
  useEffect(() => {
    const handleKey = (e) => {
      if (isAnimating.current) return;

      if (["ArrowDown", "s", "S"].includes(e.key)) {
        scrollToSection(currentIndex + 1);
      } else if (["ArrowUp", "w", "W"].includes(e.key)) {
        scrollToSection(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  // IntersectionObserver for live detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // if we're programmatically scrolling, ignore observer updates to avoid
        // selecting intermediate sections that briefly intersect during the smooth scroll
        if (suppressObserver.current) return;

        let maxVisibleIndex = currentIndex;

        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const visibleSection = sectionsRef.current.findIndex(
              (el) => el === entry.target
            );
            if (visibleSection !== -1) {
              maxVisibleIndex = visibleSection;
            }
          }
        });

        if (maxVisibleIndex !== currentIndex) {
          setCurrentIndex(maxVisibleIndex);
          router.replace(`/welcome?page=${maxVisibleIndex + 1}`, { scroll: false });
        }
      },
      {
        threshold: 0.6, // at least 60% visible counts as “active”
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [currentIndex]);

  // On mount: if a requested page/index is present in the URL, jump to it
  useEffect(() => {
    const pageParam = searchParams?.get("page");
    if (!pageParam) return;
    const idx = parseInt(pageParam, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= sections.length) return;
    // Defer slightly so refs and layout are ready
    setTimeout(() => {
      // use the same scroll helper so no-snap behavior is respected
      scrollToSection(idx);
    }, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="welcome-container">
      <header className="welcome-header" role="banner">
        <div className="welcome-header-inner">
          <div className="welcome-brand">FlameSpark</div>
          <nav className="welcome-header-nav" aria-label="Welcome navigation">
            <button className="header-action" onClick={() => scrollToSection(0)}>Home</button>
            <button className="header-action" onClick={() => scrollToSection(1)}>Mission</button>
            <button className="header-action" onClick={() => scrollToSection(2)}>Join</button>
          </nav>
        </div>
      </header>
      {sections.map((section, i) => (
        <section
          key={section.id}
          ref={(el) => (sectionsRef.current[i] = el)}
          className={`section section-${i + 1} ${i === currentIndex ? "active" : ""}`}
        >
          <WelcomeSection
            index={i}
            isActive={i === currentIndex}
            scrollToSection={scrollToSection}
          >
          </WelcomeSection>
        </section>
      ))}

      {/* Dots */}
      <div className="dots-nav">
        {sections.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => scrollToSection(i)}
          />
        ))}
      </div>
    </div>
  );
}
