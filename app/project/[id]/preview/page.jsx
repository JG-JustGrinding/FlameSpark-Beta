"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ErrorPage from "@/components/error";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { getUser } from "@/lib/projectFunctions";
import "@/styles/preview.css"
import { useRouter } from "next/navigation";
import { isUserJoinedOrOwner, joinProject, getProjectCreator } from "@/lib/projectFunctions";
import Link from "next/link";

export default function ProjectPreview(){
    const router = useRouter();
    const { id } = useParams(); // project ID from URL
    const [project, setProject] = useState(null);
    const [previewMedia, setPreviewMedia] = useState([]);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [user, setUser] = useState(null); 
    const [isJoinedSet, setIsJoinedSet] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    var previewImageIndex = 0;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      if (!currentUser)
      {
        setIsJoinedSet(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);


  useEffect(() => {
    if (!id){
        router.push("/project-not-found")
    };

    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch project info
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("id, owner_id, title, tagline, description, tags, cover_image, icon")
          .eq("id", id)
          .single();
        if (projectError) throw projectError;

        setProject(projectData);

        // Fetch preview images
        const { data: mediaData, error: mediaError } = await supabase
          .from("project_media")
          .select("url, type, order_index")
          .eq("project_id", id)
          .eq("is_preview", true)
          .order("order_index", { ascending: true });

        if (mediaError) throw mediaError;

        const mainItem = {
        url: projectData.cover_image,
        };

        const updatedMedia = [mainItem, ...(mediaData || [])];

        setPreviewMedia(updatedMedia);

        const { data: userData, error: userError } = await getUser(projectData.owner_id);
        
        if (userError) throw userError;
        setCreatorInfo(userData);
      } catch (err) {
        setError(err.message || "Failed to load project");
        router.push("/project-not-found")
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    setCurrentImage(project?.cover_image);
  }, [project]);

  useEffect(() => {
      const check = async () => {
        if (user != null && id != null)
        {
          const result = await isUserJoinedOrOwner(user.id, id);
          setIsJoined(result);
          setIsJoinedSet(true);
        }
      };

      check();
  }, [user]);

  const viewOrJoinProject = async () => {
    if (user == null){
      router.push("/login");
      return;
    }
    
    if (!isJoined)
    {
      try {
        await joinProject(user.id, id);
      } catch (error) {

      }
    }

    router.push(`/project/${id}`);
  }

  const nextImage = () => {
    previewImageIndex++;

    if (previewImageIndex >= previewMedia.length)
    {
        previewImageIndex = 0;
    }

    setCurrentImage(previewMedia[previewImageIndex].url);
  }

    return ( 
        <>
            <Header />
            <main className="main-container">
                <div className="top">
                    <div className="left">
                        <img src={project?.icon} width={48} height={48} alt="Project logo" className="project-logo"></img>
                        <h1 className="titleFont header-size project-title">{project?.title}</h1>
                    </div>
                    <div className="right">
                        {!isJoinedSet && <button className={`button-shape bodyFont skeleton join-button body-size cursor-default`} disabled>View Project</button>}
                        {isJoinedSet && <button className={`button-shape bodyFont join-button ${isJoined ? "blue" : "red"} body-size`} onClick={viewOrJoinProject}>{isJoined ? "View Project" : "Join Project"} </button>}
                    </div>
                </div>
                <div className="images">
                    <div className="current-image">
                        <img src={currentImage}></img>
                        <div className="arrows">
                            <div className="arrow left">
                                
                            </div>
                            <div className="arrow right" onClick={nextImage}>

                            </div>
                        </div>
                    </div>
                    <div className="side-images">
                        <h2 className="titleFont">Images</h2>
                        <div className="side-images-container">
                            {previewMedia.map((media, i) => (
                                <div key={i} className="side-image-container" onClick={() => {setCurrentImage(media.url)}}>
                                    <img
                                    src={media.url}
                                    alt={`Preview ${i}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="project-info">
                    <h2 className="titleFont">About This Project</h2>
                    {project?.tagline && <span className="label-color bodyFont large-caption-size">{project?.tagline}</span> }
                    {project?.description && <p className="bodyFont">{project?.description}</p> }
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
                        <img className="creator-pfp pfp-shape" src={creatorInfo?.avatar_url}></img>
                        <span className="titleFont body-size bold">{creatorInfo?.username ? creatorInfo?.username : "No Username" }</span>
                      </a>
                    </div>
                </div>
            </main>
        </>
    );
}