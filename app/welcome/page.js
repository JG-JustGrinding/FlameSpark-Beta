"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import "@/styles/landing.css";

export default function LandngPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /*
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Always show header on first page (viewport height)
      if (currentScrollY < viewportHeight) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down after first page
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);*/

  return (
    <>
      <header className={`landing-header`/* + (isVisible ? ' visible' : ' hidden')*/}>
        <div className="landing-container">
          <div className="header-content">
            <a href="/" className="header-logo">
              <img src="/logo_NoPadding_Transparent.png" alt="FlameSpark Logo" />
            </a>
            <nav className="header-nav">
              <a href="#about" className="bodyFont">About</a>
              <a href="#how-it-works" className="bodyFont">How It Works</a>
              <a href="#cta" className="bodyFont">Community</a>
              <a href="/blogs" className="bodyFont">Blogs</a>
            </nav>
            <div className="header-actions">
              <a href="/signup" className="header-btn-primary bodyFont">Become a Beta Tester</a>
              <button 
                className="hamburger-menu" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <nav className="mobile-nav">
              <a href="/signup" className="mobile-nav-cta bodyFont" onClick={() => setIsMobileMenuOpen(false)}>Become a Beta Tester</a>
              <a href="#about" className="bodyFont" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#how-it-works" className="bodyFont" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
              <a href="#cta" className="bodyFont" onClick={() => setIsMobileMenuOpen(false)}>Community</a>
              <a href="/blogs" className="bodyFont" onClick={() => setIsMobileMenuOpen(false)}>Blogs</a>
            </nav>
          )}
        </div>
      </header>
      
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="titleFont">Introducing FlameSpark</h1>
            <p className="bodyFont hide hero-subtitle">Where the Go-Getters Grow</p>
            <p className="bodyFont hero-description"><b>
              A revolutionary platform where ideas shine and creators get the recognition they deserve.
            </b></p>
            <div className="hero-cta">
                <a href="#cta" className="cta-button secondary button-shape bodyFont">Join the Community</a>
                <a href="#about" className="cta-button primary button-shape bodyFont">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/landing/lightbulb_colored.png" alt="FlameSpark Hero" className="hero-image-desktop" />
            <img src="/landing/lightbulb_colored_no_shadow.png" alt="FlameSpark Hero" className="hero-image-mobile" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <div className="about-split">
          <div className="about-visual">
            <div className="about-graphic">
              <img src="/logo_no_text.png" alt="FlameSpark Logo" />
            </div>
          </div>
          <div className="about-content">
            <h2 className="titleFont">About FlameSpark</h2>
            
            <div className="about-section">
              <h3 className="titleFont bold">A Platform Built for Creators and their Ideas</h3>
              <p className="bodyFont">
                FlameSpark is an upcoming social-media platform that focuses on the creator and their hard work put into completing their projects. We provide a platform for you to organically grow an audience with no worries of time, competition, or cost.
              </p>
            </div>

            <div className="about-section">
              <h3 className="titleFont bold">Making Discovery Possible for Every Creator</h3>
              <p className="bodyFont">
                We understand that acquiring an audience is among the most difficult tasks for anyone who puts work into creating something. We want to change that and make it possible for everyone to have their creations noticed!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-how-it-works" id="how-it-works">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-title-group">
              <img src="/FLAMESPARK_LOGO_NOBG_NO_VERTICAL_PADDING.svg" alt="FlameSpark Icon" className="section-logo-icon" />
              <h2 className="titleFont">A Quick Guide to FlameSpark</h2>
            </div>
            <p className="bodyFont">How FlameSpark Works</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-content">
                <h3 className="titleFont">Create Projects</h3>
                <div className="step-icon">
                  <img src="/landing/lightbulb.png" alt="Step 1" />
                </div>
                <p className="bodyFont">
                <b>
                  It all starts with the creation of your project. A project is a display of your journey towards finishing your creation.
                </b></p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-content">
                <h3 className="titleFont">Post/Join</h3>
                <div className="step-icon larger">
                  <img src="/landing/post_join.png" alt="Step 2" />
                </div>
                <p className="bodyFont">
                <b>
                  In your project, post updates on the progress of your creation. Your community grows easily and organically with our unique non-competitive algorithm. 
                  <br />
                  Supporters can find & join amazing projects and help support them to completion!
                </b></p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-content">
                <h3 className="titleFont">Complete</h3>
                <div className="step-icon">
                  <img src="/landing/complete.png" alt="Step 3" />
                </div>
                <p className="bodyFont">
                <b>
                  When you finish your creation, mark your project as complete. This will notify all of your supporters and they will be able to view, download, or purchase your hard work!
                </b></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="landing-cta-cards">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-title-group">
              <img src="/logo_no_text.png" alt="FlameSpark Icon" className="section-logo-icon logo-light" />
              <img src="/FLAMESPARK_LOGO_NOBG_NO_VERTICAL_PADDING.svg" alt="FlameSpark Icon" className="section-logo-icon logo-dark" />
              <h2 className="titleFont">Join the FlameSpark Community!</h2>
            </div>
            <p className="bodyFont"><i>We all start somewhere. Join the FlameSpark Community to help us create a place where the go-getters grow!</i></p>
          </div>
          <div className="cta-cards-grid">
            <a href="/signup" className="cta-card">
              <div className="cta-card-icon">🚀</div>
              <h3 className="titleFont">Become a Beta Tester</h3>
              <p className="bodyFont">Join the FlameSpark Patreon Community to support our development and gain access to FlameSpark-Beta!</p>
              <span className="cta-card-arrow">→</span>
            </a>
            <a href="/blog/the-story-of-flamespark" className="cta-card">
              <div className="cta-card-icon">📚</div>
              <h3 className="titleFont">Learn More</h3>
              <p className="bodyFont">Read about the story of FlameSpark!</p>
              <span className="cta-card-arrow">→</span>
            </a>
            <a href="/about" className="cta-card">
              <div className="cta-card-icon">🌎</div>
              <h3 className="titleFont">Join the FlameSpark Discord Community</h3>
              <p className="bodyFont">Become part of the FlameSpark Discord Community for updates, events, and conversation!</p>
              <span className="cta-card-arrow">→</span>
            </a>
            <a href="/blogs" className="cta-card">
              <div className="cta-card-icon">✨</div>
              <h3 className="titleFont">Find FlameSpark on Other Social Media</h3>
              <p className="bodyFont">Follow FlameSpark on other social media platforms for more content!</p>
              <span className="cta-card-arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
