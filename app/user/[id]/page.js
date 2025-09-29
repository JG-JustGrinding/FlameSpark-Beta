"use client";
import Header from "@/components/Header";
import "@/styles/UserPage.css"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { Paginator } from "@/lib/infinitePostFeed";
import Link from "next/link";
import { getUser, getUserJoinedProjects } from "@/lib/projectFunctions";

export default function UserPage() {
    const { id } = useParams();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await getUser(id);

        if (userError) throw userError;

        setUser(userData);

        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select(`
            id,
            title,
            tagline,
            description,
            tags,
            cover_image,
            icon
          `)
          .eq("owner_id", id);

        if (projectError) throw projectError;

        setProjects(projectData);

        const projects = await getUserJoinedProjects(id);
        setJoinedProjects(projects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

    return (
        <>
            <Header/>
            <div className="banner"></div>
            {error && <span className="error-message bodyFont">{error}</span> }
            <main className="main-container">
                <div className="user-info">
                    <div className="profile-info">
                        <img alt="Profile picture" src={user?.avatar_url ? user.avatar_url : "/profile_icon_colored.svg"} className="profile-image"></img>
                        <div className="info-container">
                            <h1 className="titleFont">{user?.username ? user.username : "No Username"}</h1>
                            <p className="bio bodyFont">{user?.bio}</p>
                            {user?.interests?.length > 0 && user.interests.some(i => i.trim() !== "") && (<span className="interests bodyFont label-color">Interests: {user?.interests?.join(", ")}</span>)}
                        </div>
                    </div>
                    <div className="stats">
                        <div className="stat-container">
                            <span className="bodyFont">Projects Created</span>
                            <h2 className="titleFont bold">{projects?.length}</h2>
                        </div>
                        <div className="stat-container">
                            <span className="bodyFont">Projects Joined</span>
                            <h2 className="titleFont bold">{joinedProjects?.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="relations">
                    <div className="items">
                        <span className={`bodyFont ${selectedIndex == 0 ? "selected" : ""}`} onClick={() => setSelectedIndex(0)}>Created Projects</span>
                        <span className={`bodyFont ${selectedIndex == 1 ? "selected" : ""}`} onClick={() => setSelectedIndex(1)}>Joined Projects</span>
                    </div>
                    <div className="relations-content">
                        {selectedIndex == 0 &&
                            projects.map((proj) => (
                                <a className="project-link" key={proj.id} href={`/project/${proj.id}/preview`}>
                                <div className="project" >
                                <div className="cover-image-wrapper">
                                    <img
                                    className="cover-image"
                                    src={proj.cover_image}
                                    alt="Cover image"
                                    />
                                </div>
                                <span className="bodyFont tagline label">
                                    <i>{proj.tagline}</i>
                                </span>
                                <div className="project-info">
                                    <img
                                    className="project-icon"
                                    src={proj.icon || "/default-icon.png"}
                                    alt="Project Icon"
                                    />
                                    <div className="project-nameandtags">
                                    <span className="project-name titleFont bold">
                                        {proj.title}
                                    </span>
                                    <div className="tags bodyFont label caption-size">
                                        <span className="text">{proj.tags?.join(", ")}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            </a>
                        ))}
                        {selectedIndex == 1 &&
                            joinedProjects.map((proj) => (
                                <a className="project-link" key={proj.id} href={`/project/${proj.id}/preview`}>
                                <div className="project" >
                                <div className="cover-image-wrapper">
                                    <img
                                    className="cover-image"
                                    src={proj.cover_image}
                                    alt="Cover image"
                                    />
                                </div>
                                <span className="bodyFont tagline label">
                                    <i>{proj.tagline}</i>
                                </span>
                                <div className="project-info">
                                    <img
                                    className="project-icon"
                                    src={proj.icon || "/default-icon.png"}
                                    alt="Project Icon"
                                    />
                                    <div className="project-nameandtags">
                                    <span className="project-name titleFont bold">
                                        {proj.title}
                                    </span>
                                    <div className="tags bodyFont label caption-size">
                                        <span className="text">{proj.tags?.join(", ")}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            </a>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
}