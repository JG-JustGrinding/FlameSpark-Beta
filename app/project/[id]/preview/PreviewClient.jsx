"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isUserJoinedOrOwner, joinProject } from "@/lib/projectFunctions";
import SignupNotice from "@/components/SignupNotice";
import "@/styles/preview.css";

export default function PreviewClient({ id, project, previewMedia, creatorInfo }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isJoinedSet, setIsJoinedSet] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
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
    if (!user) {
      setShowSignup(true);
      return;
    }

    if (!isJoined) {
      try {
        await joinProject(user.id, id);
      } catch (error) {
        
      }
    }

    router.push(`/project/${id}`);
  };

  let previewImageIndex = 0;
  const nextImage = () => {
    previewImageIndex++;
    if (previewImageIndex >= previewMedia.length) previewImageIndex = 0;
    setCurrentImage(previewMedia[previewImageIndex].url);
  };

  return (
    <main className="main-container">
      <div className="top">
        <div className="left">
          <img src={project?.icon} width={48} height={48} alt="Project logo" className="project-logo" />
          <h1 className="titleFont header-size project-title">{project?.title}</h1>
        </div>
        <div className="right">
          {!isJoinedSet && (
            <button className={`button-shape bodyFont skeleton join-button body-size cursor-default`} disabled>
              View Project
            </button>
          )}
          {isJoinedSet && (
            <button
              className={`button-shape bodyFont join-button ${isJoined ? "blue" : "red"} body-size`}
              onClick={viewOrJoinProject}
            >
              {isJoined ? "View Project" : "Join Project"}
            </button>
          )}
        </div>
      </div>
      <div className="images">
        <div className="current-image">
          <img src={currentImage} />
          <div className="arrows">
            <div className="arrow left"></div>
            <div className="arrow right" onClick={nextImage}></div>
          </div>
        </div>
        <div className="side-images">
          <h2 className="titleFont">Images</h2>
          <div className="side-images-container">
            {previewMedia.map((media, i) => (
              <div key={i} className="side-image-container" onClick={() => setCurrentImage(media.url)}>
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
        loginText="View Project Anyway"
        loginHref={`/project/${id}`}
        signupText="Login"
        signupHref={`/login?redirectUrl=/project/${id}/preview`}
      />
    </main>
  );
}
