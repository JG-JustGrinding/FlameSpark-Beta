"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isUserJoinedOrOwner, joinProject } from "@/lib/projectFunctions";
import SignupNotice from "@/components/SignupNotice";
import styles from "@/styles/preview.module.css";
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
    <main className={styles.mainContainer}>
      <div className={styles.top}>
        <div className={styles.left}>
          <a href={`/project/${id}`} className={styles.projectInfoLink}>
            <img src={project?.icon} width={48} height={48} alt="Project logo" className={styles.projectLogo} />
            <h1 className={`titleFont header-size ${styles.projectTitle}`}>{project?.title}</h1>
          </a>
          {project?.is_completed && <div className={`${styles.display} ${styles.completed}`}>
            <div className={styles.box}>
              <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
            </div>
            <span className={`bodyFont bold ${styles.text}`}>Completed</span>
          </div>}
        </div>
        <div className={styles.right}>
        {(viewCount < 100 && isJoinedSet && !isJoined && !project.is_completed) && <div className={`${styles.display} ${styles.earlySupport}`}>
          <div className={styles.box}>
            <FontAwesomeIcon icon={faExclamation} className={styles.checkIcon} />
          </div>
          <span className={`bodyFont bold ${styles.text}`}>Be among the first supporters!</span>
        </div>}
          {!isJoinedSet && (
            <a href={`/project/${id}`} className={`button-shape bodyFont skeleton join-button body-size cursor-default`}>
              View Project
            </a>
          )}
          {isJoinedSet && (
            <button
              className={`button-shape bodyFont ${styles.joinButton} ${(isJoined || project.is_completed) ? styles.blue : styles.red} body-size ${styles.appear}`}
              onClick={viewOrJoinProject}
            >
              {isJoined || project.is_completed ? "View Project" : "Join Project"}
            </button>
          )}
        </div>
      </div>
      <div className={styles.images}>
        <div className={styles.currentImage}>
          <img src={currentImage} />
          {previewMedia?.length > 1 && (
          <>
          <div className={styles.arrows}>
            <div className={`${styles.arrow} ${styles.left} no-select-pointer`} onClick={prevImage}>&#10094;</div>
            <div className={`${styles.arrow} ${styles.right} no-select-pointer`} onClick={nextImage}>&#10095;</div>
          </div>
            <div className={styles.dots}>
              {previewMedia.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === currentIndex ? styles.active : ""}`}
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
        <div className={styles.sideImages}>
          <h2 className="titleFont">Images</h2>
          <div className={styles.sideImagesContainer}>
              {previewMedia.map((media, i) => (
                <div key={i} className={styles.sideImageContainer} onClick={() => { setCurrentIndex(i); setCurrentImage(media.url); }}>
                <img src={media.url} alt={`Preview ${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.projectInfo}>
        <h2 className="titleFont">About This Project</h2>
        {project?.tagline && (
          <span className="label-color bodyFont large-caption-size">{project?.tagline}</span>
        )}
        {project?.description && <p className="bodyFont">{project?.description}</p>}
        <div className={styles.tags}>
          {project?.tags?.map((tag, i) => (
            <p key={i} className={`${styles.tag} bodyFont bold reset large-caption-size`}>
              {tag}
            </p>
          ))}
        </div>
        <div className={styles.creatorInfo}>
          <p className="bodyFont body-size">Created By: </p>
          <a className={styles.name} href={`/user/${creatorInfo?.id}`}>
            <img className="creator-pfp pfp-shape" src={creatorInfo?.avatar_url} />
            <p className="titleFont body-size bold reset" aria-label="Creator Username">{creatorInfo?.username ? creatorInfo?.username : "No Username"}</p>
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
