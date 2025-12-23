"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isUserJoinedOrOwner, joinProject } from "@/lib/projectFunctions";
import SignupNotice from "@/components/SignupNotice";
import "@/styles/preview.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamation } from "@fortawesome/free-solid-svg-icons";

export default function PreviewClient({ id, project, previewMedia, creatorInfo, viewCount }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isJoinedSet, setIsJoinedSet] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(project?.cover_image || null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      if (!currentUser) setIsJoinedSet(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const check = async () => {
      if (user && id) {
        const result = await isUserJoinedOrOwner(user.id, id);
        setIsJoined(result);
        setIsJoinedSet(true);
      }
    };
    check();
  }, [user, id]);

  // Log view once per mount
  useEffect(() => {
    const logView = async () => {
      if (!id) return;
      const { error } = await supabase.rpc("log_project_view", { p_project_id: id });
      if (error) console.error("Error logging view:", error);
    };
    logView();
  }, [id]);

  const viewOrJoinProject = async () => {
    if (!user && !project.is_completed) {
      setShowSignup(true);
      return;
    }

    if (!isJoined && !project.is_completed) {
      try {
        await joinProject(user.id, id);
      } catch (error) {
        
      }
    }

    router.push(`/project/${id}`);
  };

  useEffect(() => {
    if (previewMedia && previewMedia.length > 0) {
      const startIndex = Math.max(
        0,
        previewMedia.findIndex(m => m.url === (project?.cover_image || previewMedia[0]?.url))
      );
      setCurrentIndex(startIndex);
      setCurrentImage(previewMedia[startIndex]?.url);
    }
  }, [previewMedia, project?.cover_image]);

  const nextImage = () => {
    if (!previewMedia || previewMedia.length === 0) return;
    const next = (currentIndex + 1) % previewMedia.length;
    setCurrentIndex(next);
    setCurrentImage(previewMedia[next].url);
  };

  const prevImage = () => {
    if (!previewMedia || previewMedia.length === 0) return;
    const prev = (currentIndex - 1 + previewMedia.length) % previewMedia.length;
    setCurrentIndex(prev);
    setCurrentImage(previewMedia[prev].url);
  };

  return (
    <main className="main-container">
      <div className="top">
        <div className="left">
          <img src={project?.icon} width={48} height={48} alt="Project logo" className="project-logo" />
          <h1 className="titleFont header-size project-title">{project?.title}</h1>
          {project?.is_completed && <div className="display completed">
            <div className="box">
              <FontAwesomeIcon icon={faCheck} className="check-icon" />
            </div>
            <span className="bodyFont bold text">Completed</span>
          </div>}
        </div>
        <div className="right">
        {(viewCount < 100 && isJoinedSet && !isJoined && !project.is_completed) && <div className="display early-support">
          <div className="box">
            <FontAwesomeIcon icon={faExclamation} className="check-icon" />
          </div>
          <span className="bodyFont bold text">Be among the first supporters!</span>
        </div>}
          {!isJoinedSet && (
            <a href={`/project/${id}`} className={`button-shape bodyFont skeleton join-button body-size cursor-default`}>
              View Project
            </a>
          )}
          {isJoinedSet && (
            <button
              className={`button-shape bodyFont join-button ${(isJoined || project.is_completed) ? "blue" : "red"} body-size appear`}
              onClick={viewOrJoinProject}
            >
              {isJoined || project.is_completed ? "View Project" : "Join Project"}
            </button>
          )}
        </div>
      </div>
      <div className="images">
        <div className="current-image">
          <img src={currentImage} />
          {previewMedia?.length > 1 && (
          <>
          <div className="arrows">
            <div className="arrow left no-select-pointer" onClick={prevImage}>&#10094;</div>
            <div className="arrow right no-select-pointer" onClick={nextImage}>&#10095;</div>
          </div>
            <div className="dots">
              {previewMedia.map((_, i) => (
                <button
                  key={i}
                  className={"dot" + (i === currentIndex ? " active" : "")}
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => {
                    setCurrentIndex(i);
                    setCurrentImage(previewMedia[i].url);
                  }}
                />
              ))}
            </div>
            </>
          )}
        </div>
        <div className="side-images">
          <h2 className="titleFont">Images</h2>
          <div className="side-images-container">
              {previewMedia.map((media, i) => (
                <div key={i} className="side-image-container" onClick={() => { setCurrentIndex(i); setCurrentImage(media.url); }}>
                <img src={media.url} alt={`Preview ${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="project-info">
        <h2 className="titleFont">About This Project</h2>
        {project?.tagline && (
          <span className="label-color bodyFont large-caption-size">{project?.tagline}</span>
        )}
        {project?.description && <p className="bodyFont">{project?.description}</p>}
        <div className="tags">
          {project?.tags?.map((tag, i) => (
            <span key={i} className="tag bodyFont bold large-caption-size">
              {tag}
            </span>
          ))}
        </div>
        <div className="creator-info">
          <span className="bodyFont body-size">Created By: </span>
          <a className="name" href={`/user/${creatorInfo?.id}`}>
            <img className="creator-pfp pfp-shape" src={creatorInfo?.avatar_url} />
            <span className="titleFont body-size bold">{creatorInfo?.username ? creatorInfo?.username : "No Username"}</span>
          </a>
        </div>
      </div>
      <SignupNotice
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        message="Log in or create a FlameSpark-Beta account to join and support projects!"
        loginText="View Project as Guest"
        loginHref={`/project/${id}`}
        signupText="Login"
        signupHref={`/login?redirectUrl=/project/${id}/preview`}
      />
    </main>
  );
}
