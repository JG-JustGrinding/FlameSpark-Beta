"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const errorDescription = params.get("error_description");

    if (errorDescription) {
      setErrorMessage(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
    }
  }, []);

  useEffect(() => {
    async function checkUser() {

      const showParam = searchParams.get("show");
      if (showParam === "verify_email") {
        setWarningMessage("Please verify your email to log in.");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();

        if (user && !user.email_confirmed_at) {
          setWarningMessage("Your email is not verified. Please check your inbox to confirm, or you may not be able to log in.");
        }
      }

      checkUser();
    }, [searchParams]);

  return (
    <div>

      {errorMessage && (
        <div style={{
          backgroundColor: "var(--error-color, #000000)",
          color: "var(--white, #ffffff)",
          padding: "12px 20px",
          borderRadius: "5px",
          margin: "10px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span className="titleFont">Error: {errorMessage}</span>
          <button className="titleFont"
            onClick={() => setErrorMessage("")}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: "bold",
              cursor: "pointer",
              color: "var(--white, #ffffff)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {warningMessage && (
        <div style={{
          backgroundColor: "var(--warning-color, #000000)",
          color: "var(--white, #ffffff)",
          padding: "12px 20px",
          borderRadius: "5px",
          margin: "10px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span className="titleFont">{warningMessage}</span>
          <button className="titleFont"
            onClick={() => setWarningMessage("")}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: "bold",
              cursor: "pointer",
              color: "var(--white, #ffffff)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <Header />

      <main>
        <h1 style={{
          height: "1000px"
        }}>Welcome to My Social Media MVP!</h1>

      </main>
    </div>
  );
}
