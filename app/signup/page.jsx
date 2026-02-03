"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faTag, faLock, faKey } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/auth.module.css";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
import PanelOverlay from "@/components/PanelOverlay";
import PatreonCommunityPanel from "./PatreonCommunityPanel";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectUrl") || "/";
  const mode = searchParams.get("mode") || "";

  const sanitizeRedirect = (url) => {
    try {
      if (typeof url !== "string") return "/";
      if (!url.startsWith("/")) return "/";
      if (url.length > 2048) return "/";
      return url;
    } catch {
      return "/";
    }
  };

  const redirectUrl = sanitizeRedirect(rawRedirect);
  const [accessKey, setAccessKey] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPatreonCommunityPanel, setShowPatreonCommunityPanel] = useState(false);
  const useEmailField = process.env.NEXT_PUBLIC_LOGIN_SIGNUP_WITH_EMAIL_FIELD;

  const handleSignup = async () => {
    setError("");

    if (!email || !password || !username) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (username.length > 25) {
      setError("Username must not be greater than 25 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          accessKey,
          username
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push("/?show=signup_success");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <>
      <Header />

      <main className={styles.mainContainer}>
        <div className={styles.background}>
          <img
            src="/Login-Signup Background.png"
            alt="Background"
            className={styles.notMobile}
          />
          <img
            src="/Login-Signup Background Mobile Variation.jpeg"
            alt="Background Mobile"
            className={styles.mobile}
          />
        </div>

        <div className={styles.container}>
          <div className={styles.topBar}>
            <a href={"/login" + (mode == useEmailField ? `?mode=${useEmailField}` : "")} className={`${styles.left} ${styles.button} button-shape bodyFont ${styles.off}`}>
              Log In
            </a>
            <button className={`${styles.right} ${styles.button} button-shape bodyFont ${styles.cursorDefault}`}>Sign Up</button>
          </div>

          <h1 className={`titleFont header-size ${styles.mainTitle}`}>Sign Up for FlameSpark-Beta!</h1>

          {error && <p className="titleFont error-message">{error}</p>}

          {mode == useEmailField && <div className={styles.authContent}>
            <div className={styles.inputContainer}>
              <div className={styles.label}>
                <FontAwesomeIcon icon={faKey} />
                <p className="bodyFont body-size bold">Access Key</p>
              </div>
              <input
                className="bodyFont input-field"
                type="password"
                placeholder="Enter text here..."
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
            </div>

            <div className={styles.emailAndUser}>
              <div className={styles.inputContainer}>
                <div className={styles.label}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  <p className="label-color bodyFont body-size">Email Address</p>
                </div>
                <input
                  className="bodyFont input-field"
                  type="email"
                  placeholder="Enter text here..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.inputContainer}>
                <div className={styles.label}>
                  <FontAwesomeIcon icon={faTag} />
                  <p className={`label-color bodyFont body-size`}>Username</p>
                </div>
                <input
                  className="bodyFont input-field"
                  type="text"
                  placeholder="Enter text here..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputContainer}>
              <div className={styles.label}>
                <FontAwesomeIcon icon={faLock} />
                <p className="label-color bodyFont body-size">Password</p>
              </div>
              <input
                className="bodyFont input-field"
                type="password"
                placeholder="Enter text here..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={styles.inputContainer}>
              <div className={styles.label}>
                <FontAwesomeIcon icon={faLock} />
                <p className="label-color bodyFont body-size">Confirm Password</p>
              </div>
              <input
                className="bodyFont input-field"
                type="password"
                placeholder="Enter text here..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className={`button-shape ${styles.inputButton} bodyFont ${styles.red} ${styles.authButton}`}
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Signup"}
            </button>

            <div className={styles.bottomSection}>
              {false && <button onClick={handleGoogleLogin} className={`button-shape ${styles.inputButton} bodyFont ${styles.clear}`}>
                <img src="/logo_google.png" alt="Google Logo" />
                Signup with Google
              </button>}

              <div className={styles.bottom}>
                <p className={`label-color reset bodyFont ${styles.accountIf}`} style={{ marginRight: '15px', marginBottom: '5px' }}>
                  Already have an account? <Link href={mode == useEmailField ? `login?mode=${useEmailField}` : "/login"}>log in</Link>
                </p>
                <p className={`reset label-color bodyFont ${styles.accountIf}`}>
                  By signing up you agree to our <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>}
          {mode != useEmailField && <div className={styles.authContent}>
            <p className="bodyFont body-size">
              Access to FlameSpark-Beta is granted by supporting the development of FlameSpark through joining the FlameSpark Patreon Community. Please visit our Patreon to sign up!
            </p>
            <a href="https://www.patreon.com/flamespark" target="_blank" rel="noopener noreferrer" className={`button-shape ${styles.inputButton} bodyFont ${styles.red} ${styles.authButton}`} >
              <FontAwesomeIcon icon={faPatreon} style={{ marginRight: '5px' }} />
              Visit Our Patreon
            </a>
            <button onClick={() => setShowPatreonCommunityPanel(true)} className={`button-shape ${styles.inputButton} bodyFont ${styles.clear} ${styles.authButton}`}>
              Tell Me More
            </button>
            <div className={styles.bottom}>
              <p className={`label-color reset bodyFont ${styles.accountIf}`} style={{ marginRight: '15px', marginBottom: '5px' }}>
                Already a Member? <Link href={mode == useEmailField ? `login?mode=${useEmailField}` : "/login"}>log in</Link>
              </p>
              <p className={`reset label-color bodyFont ${styles.accountIf}`}>
                By signing up you agree to our <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </div>
          </div>}
        </div>
        <PatreonCommunityPanel isOpen={showPatreonCommunityPanel} onClose={() => setShowPatreonCommunityPanel(false)} styles={styles} />
      </main>
    </>
  );
}
