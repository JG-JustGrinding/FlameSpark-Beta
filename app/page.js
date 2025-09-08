"use client";

import Image from "next/image";
import "./page.css";
import Header from "@/components/Header";
import SidePanel from "@/components/SidePanel";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
const PAGE_SIZE = 10;

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();

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

  useEffect(() => {
    fetchProjects(0).then(() => {
      ensureFill(); // <- auto-fill screen if not enough projects
    });
  }, []);

  const ensureFill = async () => {
    while (document.body.scrollHeight <= window.innerHeight && hasMore) {
      await loadMoreProjects();
    }
  };

  const loadMoreProjects = async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchProjects();
    }
  };

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 300
      ) {
        loadMoreProjects();
      }
    }, 150); // ms

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });


  const fetchProjects = async () => {
    const { data, error } = await supabase.rpc("random_projects", { limit_count: PAGE_SIZE });

    if (error) {
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) 
    {
      setHasMore(false);
    }

    setProjects((prev) => [...prev, ...data]);
    setLoading(false);
  };

  function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

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
            {projects.map((project, i) => (
            <a href={`project/${project.id}/preview`} key={i} className="project">
              <div className="cover-image-wrapper">
                <img className="cover-image" src={project.cover_image} alt="Cover image"></img>
              </div>
              <span className="bodyFont tagline label"><i>{project.tagline}</i></span>
              <div className="project-info">
                <img className="project-icon" src={project.icon} alt="Project Icon"></img>
                <div className="project-nameandtags">
                  <span className="project-name titleFont bold">{project.title}</span>
                  <div className="tags bodyFont label caption-size">
                    <span className="text">{project.tags?.join(", ")}</span>
                  </div>
                </div>
              </div>
            </a>
            ))}
          </div>
          {loading && <p className="bodyFont body-size bold no-more">Loading...</p>}
          {!hasMore && <p className="bodyFont body-size bold no-more">No more projects...</p> }
        </div>
      </main>
    </>
  );
}
