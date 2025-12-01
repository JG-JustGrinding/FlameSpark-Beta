import '@/styles/landing.css';
import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
    return (
    <>
        <nav className="landing-nav">
            <Link href="/" className="landing-logo titleFont">FlameSpark</Link>
            <div className="landing-nav-links">
                <Link href="/login" className="landing-nav-link bodyFont">Login</Link>
                <Link href="/signup" className="landing-nav-link bodyFont">Sign Up</Link>
            </div>
        </nav>
        <div className="landing-page">
            <main className="landing-main">
                <section className="landing-section intro">
                    <h1 className="landing-subtitle">First Page</h1>
                </section>
                <section className="landing-section about">
                    <div className="graphic-container">
                        <div className="background">
                            <img src="/landing/geometric_background_bright.png" alt="Geometric Background" className="about-graphic-background"/>
                        </div>
                        <img src="/logo_no_text.png" alt="FlameSpark-Icon" className="about-graphic"/>
                    </div>
                    <div className="text-container">
                        <h1 className="about-title titleFont reset">FlameSpark: Turning Passion into Recognition</h1>
                        <div className="paragraph">
                            <h2 className="about-subtitle titleFont bold reset">A Platform Built for Creators</h2>
                            <p className="about-description bodyFont bold reset"><strong>
                                FlameSpark is an upcoming social-media platform that focuses on the creator and their hard work put into completing their projects. We provide a platform for you to organically grow an audience with no worries of time, competition, or cost.</strong>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="landing-footer">
                <p className="landing-text">© 2025 FlameSpark. All rights reserved.</p>
            </footer>
        </div>
    </>
  );
}