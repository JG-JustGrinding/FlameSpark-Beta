"use client";
import "@/styles/UserPage.css";
import { useState } from "react";

export default function UserClient({ user, projects, joinedProjects }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <div className="banner"></div>
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
                  <div className="project">
                    <div className="cover-image-wrapper">
                      <img className="cover-image" src={proj.cover_image} alt="Cover image" />
                    </div>
                    <span className="bodyFont tagline label">
                      <i>{proj.tagline}</i>
                    </span>
                    <div className="project-info">
                      <img className="project-icon" src={proj.icon || "/default-icon.png"} alt="Project Icon" />
                      <div className="project-nameandtags">
                        <span className="project-name titleFont bold">{proj.title}</span>
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
                  <div className="project">
                    <div className="cover-image-wrapper">
                      <img className="cover-image" src={proj.cover_image} alt="Cover image" />
                    </div>
                    <span className="bodyFont tagline label">
                      <i>{proj.tagline}</i>
                    </span>
                    <div className="project-info">
                      <img className="project-icon" src={proj.icon || "/default-icon.png"} alt="Project Icon" />
                      <div className="project-nameandtags">
                        <span className="project-name titleFont bold">{proj.title}</span>
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
  );
}
