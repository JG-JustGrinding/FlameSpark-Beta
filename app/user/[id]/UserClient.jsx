"use client";
import "@/styles/UserPage.css";
import "@/styles/content.css";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Paginator } from "@/lib/paginator";
import PrimaryProject from "@/components/PrimaryProject";

export default function UserClient({ user, initialProjects = [], initialJoinedProjects = [], initialHasMoreCreated = true, initialHasMoreJoined = true, pageSize = 10, userId, totalCreatedCount = 0, totalJoinedCount = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [createdProjects, setCreatedProjects] = useState(initialProjects);
  const [joined, setJoined] = useState(initialJoinedProjects);
  const [createdPage, setCreatedPage] = useState(initialProjects.length > 0 ? 0 : -1);
  const [joinedPage, setJoinedPage] = useState(initialJoinedProjects.length > 0 ? 0 : -1);
  const [hasMoreCreated, setHasMoreCreated] = useState(initialHasMoreCreated);
  const [hasMoreJoined, setHasMoreJoined] = useState(initialHasMoreJoined);
  const [loadingCreated, setLoadingCreated] = useState(false);
  const [loadingJoined, setLoadingJoined] = useState(false);

  const fetchCreated = async (page) => {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, tagline, description, tags, cover_image, icon, is_completed")
      .eq("owner_id", userId)
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) return [];
    setCreatedProjects(prev => [...prev, ...(data || [])]);
    if (!data || data.length < pageSize) setHasMoreCreated(false);
    return data || [];
  };

  const fetchJoined = async (page) => {
    // TODO: Implement proper pagination for joined projects via backend.
    setHasMoreJoined(false);
    return [];
  };

  return (
    <>
      <div className="user-page-banner"></div>
      <main className="main-container">
        <div className="user-info">
          <div className="profile-info">
            <img alt="Profile picture" src={user?.avatar_url ? user.avatar_url : "/profile_icon_colored.svg"} className="profile-image" />
            <div className="info-container">
              <h1 className="titleFont">{user?.username ? user.username : "No Username"}</h1>
              <p className="bio bodyFont">{user?.bio}</p>
              {user?.interests?.length > 0 && user.interests.some(i => i.trim() !== "") && (
                <span className="interests bodyFont label-color">Interests: {user?.interests?.join(", ")}</span>
              )}
            </div>
          </div>
          <div className="stats">
            <div className="stat-container">
              <span className="bodyFont">Projects Created</span>
              <h2 className="titleFont bold">{totalCreatedCount}</h2>
            </div>
            <div className="stat-container">
              <span className="bodyFont">Projects Joined</span>
              <h2 className="titleFont bold">{totalJoinedCount}</h2>
            </div>
          </div>
        </div>
        <div className="relations">
          <div className="items">
            <span className={`bodyFont ${selectedIndex == 0 ? "selected" : ""}`} onClick={() => setSelectedIndex(0)}>Created Projects</span>
            <span className={`bodyFont ${selectedIndex == 1 ? "selected" : ""}`} onClick={() => setSelectedIndex(1)}>Joined Projects</span>
          </div>
          <div className="content">
            {selectedIndex == 0 && (
              <Paginator
                items={createdProjects}
                page={createdPage}
                setPage={setCreatedPage}
                hasMore={hasMoreCreated}
                setHasMore={setHasMoreCreated}
                loading={loadingCreated}
                setLoading={setLoadingCreated}
                fetchFunction={fetchCreated}
                renderItem={(proj) => (
                  <PrimaryProject key={proj.id} project={proj} />
                )}
              />
            )}
            {selectedIndex == 1 && (
              <Paginator
                items={joined}
                page={joinedPage}
                setPage={setJoinedPage}
                hasMore={hasMoreJoined}
                setHasMore={setHasMoreJoined}
                loading={loadingJoined}
                setLoading={setLoadingJoined}
                fetchFunction={fetchJoined}
                renderItem={(proj) => (
                  <PrimaryProject key={proj.id} project={proj} />
                )}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
