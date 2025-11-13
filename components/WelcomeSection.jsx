"use client";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faGem, faLightbulb, faSeedling, faTimeline } from "@fortawesome/free-solid-svg-icons";

/**
 * WelcomeSection
 * - index: number
 * - isActive: boolean
 * - onSelected: (index) => void
 * - onDeselected: (index) => void
 */
export default function WelcomeSection({ index, isActive, scrollToSection }) {
  const wasActive = useRef(false);

  const onSelected = (idx) => {
    // default hook: you can replace this with any behavior
    // fires when this section becomes active
    //console.log("WelcomeSection selected:", idx);
  };

  const onDeselected = (idx) => {
    // fires when this section is no longer active
    //console.log("WelcomeSection deselected:", idx);
  };

  useEffect(() => {
    if (isActive && !wasActive.current) {
      onSelected?.(index);
      wasActive.current = true;
    } else if (!isActive && wasActive.current) {
      onDeselected?.(index);
      wasActive.current = false;
    }
  }, [isActive, index, onSelected, onDeselected]);

  if (index == 0)
  {
    return (
      <div className={`section-content${isActive ? " active" : ""}`} aria-hidden={!isActive}>
        <div className="middle">
          <div className="middle-content">
            <div className="text">
                <h1 className="flameSparkFont reset">FlameSpark: A Revolutionary New Platform</h1>
                <p className="bodyFont">How FlameSpark gives ideas a fair chance to grow and shine</p>
            </div>
            <img src="/logo_no_text.png" alt="FlameSpark Logo" />
          </div>
        </div>
        <div className="bottom">
            <div className="graphic-bar-1"></div>
            <button className="scroll-button bodyFont button-shape red-color" onClick={() => {scrollToSection(index + 1);}}>Continue</button>
            <div className="graphic-bar-2"></div>
        </div>
      </div>
    );
  }

  if (index == 1) {
    // sequenced snippets for the cinematic mini-story
    const snippets = [
      { id: 'a', icon: faLightbulb, text: 'There are incredible ideas everywhere.' },
      { id: 'b', icon: faSeedling, text: 'They start small, like a seed planted in our mind.' },
      { id: 'c', icon: faClock, text: 'But with time, attention, and a lot of heart...' },
      { id: 'd', icon: faGem, text: 'They grow, evolve, and become something unique, exciting, and full of potential.' },
    ];

    const [idx, setIdx] = useState(0);
    const [intro, setIntro] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
      if (isActive) {
        // trigger intro animations
        setIntro(true);
        // reset index when section becomes active
        setIdx(0);
      } else {
        setIntro(false);
        setIdx(0);
        clearTimeout(timerRef.current);
      }
      return () => clearTimeout(timerRef.current);
    }, [isActive]);

    const onContinue = (e) => {
      // blur so control doesn't stay focused
      try { e.currentTarget.blur?.(); } catch (err) {}
      if (idx < snippets.length - 1) {
        setIdx((s) => s + 1);
      } else {
        if (typeof scrollToSection === 'function') scrollToSection(index + 1);
      }
    };

    const onPrev = (e) => {
      try { e.currentTarget.blur?.(); } catch (err) {}
      setIdx((s) => Math.max(s - 1, 0));
    };

    const handleSnippetClick = (e, i) => {
      // Make snippets tappable on mobile: if user taps the currently visible
      // snippet advance, otherwise jump to that snippet.
      try { e.currentTarget.blur?.(); } catch (err) {}
      if (i === idx) {
        onContinue(e);
      } else {
        setIdx(i);
      }
    };

    return (
      <div className={`section-content cinematic${isActive ? ' active' : ''}`} aria-hidden={!isActive}>
        <div className={`snippets ${intro ? 'intro' : ''}`}>
          {snippets.map((s, i) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={(e) => handleSnippetClick(e, i)}
              className={`text-snippet ${i === idx ? 'visible' : 'hidden'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
              aria-hidden={i !== idx}
            >
              <div className="snippet-icon">
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <p className="snippet-text bodyFont reset">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="snippet-controls bodyFont">
          <button className="snippet-btn" onClick={onPrev} disabled={idx === 0} aria-label="Previous">◀</button>
          <button className="snippet-btn primary" onClick={onContinue} aria-label="Continue">
            {idx < snippets.length - 1 ? 'Next' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  if (index == 2)
  {
    const [wipeOnce, setWipeOnce] = useState(false);
    useEffect(() => {
      if (isActive) setWipeOnce(true);
    }, [isActive, wipeOnce]);

    return (
      <div className={`section-content${isActive ? " active" : ""}`} aria-hidden={!isActive}>
        <h2 className={`bodyFont reset intro-text ${wipeOnce ? 'wipe-in-left typewriter-start' : ''}`}>But here's the thing...</h2>
      </div>
    );
  }

  return (
    <div className={`section-content${isActive ? " active" : ""}`} aria-hidden={!isActive}>
      <></>
    </div>
  );
}
