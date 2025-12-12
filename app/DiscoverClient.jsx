"use client";

import { useEffect, useState } from "react";
import PrimaryProject from "@/components/PrimaryProject";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
import { Paginator } from "@/lib/paginator";
import "@/styles/DiscoverPage.css";

const PAGE_SIZE = 10;

export default function DiscoverClient({ initialProjects = [], initialError = "", initialHasMore = true }) {
  const [errorMessage, setErrorMessage] = useState(initialError || "");
  const [warningMessage, setWarningMessage] = useState("");
  const [projects, setProjects] = useState(initialProjects || []);
  const [page, setPage] = useState(initialProjects?.length > 0 ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        setWarningMessage("Your email is not verified. Please check your inbox to confirm, or you may not be able to log in.");
      }
    }
    checkUser();
  }, []);

  const fetchProjects = async (nextPage) => {
    const { data, error } = await supabase.rpc("get_random_projects", { limit_count: PAGE_SIZE });
    if (error) {
      setLoading(false);
      return [];
    }
    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }
    setProjects((prev) => [...prev, ...data]);
    setLoading(false);
    return data;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function renderProject(project, i) {
    return <PrimaryProject project={project} key={i} />;
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

      <div className="content">
        <Paginator
          items={projects}
          page={page}
          setPage={setPage}
          hasMore={hasMore}
          setHasMore={setHasMore}
          loading={loading}
          setLoading={setLoading}
          fetchFunction={fetchProjects}
          renderItem={renderProject}
          noneFoundMessage="No projects found."
          noMoreObject={
            <div className="end-of-discover bodyFont">
              <div className="titleFont" style={{ fontSize: "1.25rem", fontWeight: 700, width: "100%" }}>
                You’ve reached the end of the Discover page!
              </div>
              <p className="reset">
                FlameSpark is a new and upcoming platform. As more creators join, more projects will appear.
              </p>
              <p className="reset">
                Want to contribute? Create a project to start your journey!
              </p>
              <div style={{ marginTop: 12 }}>
                <Link href="/create" className="bodyFont" style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "var(--flamespark-red)",
                  color: "var(--white)",
                  textDecoration: "none",
                  fontWeight: 700
                }}>
                  Create a Project
                </Link>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
