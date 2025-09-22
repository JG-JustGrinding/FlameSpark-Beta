"use client";

import Image from "next/image";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import PrimaryProject from "@/components/PrimaryProject";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
const PAGE_SIZE = 10;

export default function Discover() {
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
    fetchProjects().then(() => {
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
    const { data, error } = await supabase.rpc("get_random_projects", { limit_count: PAGE_SIZE });

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

      <PrimaryPageLayout title="Discover" description="Find amazing new projects to be part of">
          <div className="content">
            {projects.map((project, i) => (
              <PrimaryProject project={project} key={i}/>
            ))}
          </div>
          {loading && <p className="bodyFont body-size bold no-more">Loading...</p>}
          {!hasMore && <p className="bodyFont body-size bold no-more">No more projects...</p> }
      </PrimaryPageLayout>
    </>
  );
}
