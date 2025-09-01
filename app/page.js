"use client";

import Image from "next/image";
import "./page.css";
import Header from "@/components/Header";
import SidePanel from "@/components/SidePanel";
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
    <>
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

      <main className="main-container">
        <SidePanel />
        <div className="container">
          <div className="title">
            <h1 className="titleFont header-size">Discover</h1>
            <p className="bodyFont body-size label">Find amazing new projects to be part of</p>
          </div>
          <div className="content">
            <div className="project">
              <div className="cover-image-wrapper">
                <img className="cover-image" src="https://th.bing.com/th/id/R.ede46a9dfee948097c32754539f748b5?rik=DtAKs02lpfOoNQ&riu=http%3a%2f%2fcdn.wallpapersafari.com%2f2%2f99%2fjfFvcC.jpg&ehk=ERm69cf8%2bCml3Q1JkF8%2bBDbZiNBoF1C1iNhDQZKcISM%3d&risl=&pid=ImgRaw&r=0" alt="Cover image"></img>
              </div>
              <span className="bodyFont tagline label"><i>A project about...</i></span>
              <div className="project-info">
                <img className="project-icon" src="https://tse2.mm.bing.net/th/id/OIP.9YCks5t7F6UKg-KB1U-OXAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Project Icon"></img>
                <div className="project-nameandtags">
                  <span className="project-name titleFont bold">Project name</span>
                  <div className="tags bodyFont label caption-size">
                    <span className="text">tag 1 tag 2 tag 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
