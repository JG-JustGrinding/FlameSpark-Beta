"use client";

import Header from "@/components/Header";
import "../../styles/auth.css";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawRedirect = searchParams.get("redirectUrl") || "/";

    const sanitizeRedirect = (url) => {
        try {
            if (typeof url !== "string") return "/";
            // Only allow same-site relative paths to prevent open redirects
            if (!url.startsWith("/")) return "/";
            // basic length cap
            if (url.length > 2048) return "/";
            return url;
        } catch {
            return "/";
        }
    };

    const redirectUrl = sanitizeRedirect(rawRedirect);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
    const persist = document.getElementById("remember-me-checkbox").checked;

    setError("");

    if (!email || !password) {
        setError("All fields are required");
        return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    }, {
        options: {
            persistSession: persist,
        },
    });

    if (error) {
        setLoading(false);
        setError(error.message);
    } else {
        router.push(redirectUrl);
        }
    };

    const handleGoogleLogin = async () => {
        const absoluteRedirect = `${window.location.origin}${redirectUrl}`;
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
            redirectTo: absoluteRedirect,
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
                    <img src="/Login-Signup Background.png" className="not-mobile"/>
                    <img src="/Login-Signup Background Mobile Variation.jpeg" className="mobile"/>
                </div>
                <div className="container">
                    <div className="top-bar">
                        <button className="left button button-shape bodyFont cursor-default">Log In</button>
                        <a href="/signup" className="right button button-shape bodyFont off">Sign Up</a>
                    </div>

                    <h1 className="titleFont header-size">Log In to FlameSpark-Beta</h1>
                    {error && <p className="error-message titleFont">Error: {error}</p>}
                    <div className="auth-content">
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
                        <div className="checkbox-container">
                            <input id="remember-me-checkbox" className="checkbox red" type="checkbox" defaultChecked />
                            <label htmlFor="remember-me-checkbox" className="bodyFont body-size">Remember Me</label>
                        </div>
                        <button className={`button-shape input-button bodyFont red auth-button`}
                        onClick={handleLogin}
                        disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <div className="bottom-section">
                            <button className="button-shape input-button bodyFont clear" 
                            onClick={handleGoogleLogin}><img src="/logo_google.png"/>
                            Login with Google
                            </button>
                            <p className="label-color bodyFont account-if">Don't have an account? <a href="/signup">sign up</a></p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}