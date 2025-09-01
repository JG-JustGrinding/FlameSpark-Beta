"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import "../../styles/auth.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faTag, faLock } from "@fortawesome/free-solid-svg-icons";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
          router.push("/");
      }
      };
      checkUser();
  }, [router, supabase]);

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

    if (username.length > 25)
    {
      setError("Username must not be greater than 25 characters long");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
        router.push("/?show=verify_email");    
      }
  };

    const handleGoogleLogin = async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
          redirectTo: 'http://localhost:3000',
          },
      });

      if (error) {
          setError(error.message);
      }
  };

  return (
    <>
      <Header />

      <main className="main-container">
        <div className="background">
          <img
            src="/Login-Signup Background.png"
            alt="Background"
            className="not-mobile"
          />
          <img
            src="/Login-Signup Background Mobile Variation.jpeg"
            alt="Background Mobile"
            className="mobile"
          />
        </div>

        <div className="container">
          <div className="top-bar">
            <Link href="/login" className="left button button-shape bodyFont off">
              Log In
            </Link>
            <button className="right button button-shape bodyFont">Sign Up</button>
          </div>

          <h1 className="titleFont header-size">Sign Up for FlameSpark</h1>

          {error && <p className="titleFont">{error}</p>}

          <div className="auth-content">
            <div className="email-and-user">
              <div className="input-container">
                <div className="label">
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

              <div className="input-container">
                <div className="label">
                  <FontAwesomeIcon icon={faTag} />
                  <p className="label-color bodyFont body-size">Username</p>
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

            <div className="input-container">
              <div className="label">
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

            <div className="input-container">
              <div className="label">
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
              className={`button-shape input-button bodyFont blue ${loading ? "auth-button-off" : ""}`}
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Signup"}
            </button>

            <div className="bottom-section">
              <button onClick={handleGoogleLogin} className="button-shape input-button bodyFont clear auth-button">
                <img src="/logo_google.png" alt="Google Logo" />
                Signup with Google
              </button>
              <p className="label-color bodyFont account-if">
                Already have an account? <Link href="/login">log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
