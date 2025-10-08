"use client"
import Header from "@/components/Header";
import Unauthorized from "@/components/Unauthorized";
import ErrorComponent from "@/components/ErrorComponent"
import DashboardCard from "@/components/DashboardCard";
import { useUser } from "@/lib/useUser";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/dashboard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faChartBar, faLayerGroup, faPaintBrush, faList, faNoteSticky, faHeart, faGlobe, faFireFlameCurved, faLock, faL } from '@fortawesome/free-solid-svg-icons'
import CappedInput from "@/components/CappedInput";
import ArrayInputField from "@/components/ArrayInputField";
import PreviewImagesContainer from "@/components/PreviewImagesContainer";

export default function ProjectPage(){
    const { id } = useParams();
    const { user, userSet } = useUser();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);
    const items = [];
    const unlockableItems = [];

    // details
    const [projectTitle, setProjectTitle] = useState("");
    const [projectTagline, setProjectTagline] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectTags, setProjectTags] = useState([]);
    const [detailsUpdatePending, setDetailsUpdatePending] = useState(false);

    const [coverImage, setCoverImage] = useState(null);
    const [iconImage, setIconImage] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);

    const [coverUpload, setCoverUpload] = useState(null);
    const [iconUpload, setIconUpload] = useState(null);
    const [previewUpload, setPreviewUpload] = useState([]);
    const [previewImagesUpdatePending, setPreviewImagesUpdatePending] = useState(false);

    const [projectDetailsError, setProjectDetailsError] = useState("");
    const [coverImageError, setCoverImageError] = useState("");
    const [iconError, setIconError] = useState("");
    const [previewImagesError, setPreviewImagesError] = useState("");

    // for updating details
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [coverImageLoading, setCoverImageLoading] = useState(false);
    const [iconLoading, setIconLoading] = useState(false);
    const [previewImagesLoading, setPreviewImagesLoading] = useState(false);

    const coverImageInputRef = useRef(null);
    const iconImageInputRef = useRef(null);
    const previewImageInputRef = useRef(null);
    
    function PushItem(name, icon, itemArray, fullName = undefined) {
        itemArray.push({name, icon, fullName});
    }

    PushItem("Details", faPencil, items, "Project Details");
    PushItem("Analytics", faChartBar, items);
    PushItem("Posts", faLayerGroup, items);

    PushItem("Theme", faPaintBrush, unlockableItems);
    PushItem("To-Do List", faList, unlockableItems);
    PushItem("Stickers", faNoteSticky, unlockableItems);
    PushItem("Reactions", faHeart, unlockableItems);
    PushItem("Community", faGlobe, unlockableItems);

    if (user == null)
    {

    }

    useEffect(() => {
    const fetchProject = async () => {
        if (project)
        {
            return;
        }

      setLoading(true);
      // fetch project by ID
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

        const { data: mediaData, error: mediaError } = await supabase
            .from("project_media")
            .select("id, url, type, order_index")
            .eq("project_id", id)
            .eq("is_preview", true)
            .order("order_index", { ascending: true });

        if (mediaError) throw mediaError;

      if (error || mediaError || !projectData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // check authorization
      if (userSet)
      {
        if (!user || user.id !== projectData.owner_id) {
            setUnauthorized(true);
            setProject(projectData);
            setLoading(false);
            return;
        }
      }

      setProject(projectData);

      // set project values
      setProjectTitle(projectData?.title);
      setProjectDescription(projectData?.description);
      setProjectTagline(projectData?.tagline);
      setProjectTags(projectData?.tags);

      setPreviewImages(mediaData);
      setPreviewUpload(mediaData); // need to check to see if the id is defined to tell if the image should be reordered or not

      setLoading(false);
    };

    fetchProject();
  }, [id, user, userSet]);

  useEffect(() => {
    if (projectTitle === project?.title && projectDescription === project?.description && projectTagline === project?.tagline && projectTags === project?.tags)
    {
        return;
    }

    if (!projectTitle || !projectDescription)
    {
        return;
    }

    setProjectDetailsError("");
    setDetailsUpdatePending(true);
  }, [ projectTitle, projectDescription, projectTagline, projectTags ]);

  
  useEffect(() => {
    setPreviewImagesUpdatePending(true);
  }, [ previewUpload ]);

    if (loading || !userSet) return (
        <>
        </>
    )

    if (notFound) return <ErrorComponent />;
    if (unauthorized) return <Unauthorized />;

  const handleCoverChange = (e) => {
    if (coverImage)
    {
        URL.revokeObjectURL(coverImage);
    }

    if (e.target.files && e.target.files[0]) {
      setCoverImage(URL.createObjectURL(e.target.files[0]));
      setCoverUpload(e.target.files[0]);
    } else {
      setCoverImage(null);
      setCoverUpload(null); 
    }
  };

  const handleIconChange = (e) => {
    if (iconImage)
    {
        URL.revokeObjectURL(iconImage);
    }

    if (e.target.files && e.target.files[0]) {
      setIconImage(URL.createObjectURL(e.target.files[0]));
      setIconUpload(e.target.files[0]);
    } else {
      setIconImage(null);
      setIconUpload(null);
    }
  };

  const removeCoverImage = () => {
    if (coverImage)
    {
        URL.revokeObjectURL(coverImage);
    }

    setCoverImage(null);
    setCoverUpload(null);

    coverImageInputRef.current.value = '';
  }

  const removeIconImage = () => {
    if (iconImage)
    {
        URL.revokeObjectURL(iconImage);
    }

    setIconImage(null);
    setIconUpload(null);
    iconImageInputRef.current.value = '';
  }

  function resetProjectDetails() {
    setProjectTitle(project?.title);
    setProjectDescription(project?.description);
    setProjectTagline(project?.tagline);
    setProjectTags(project?.tags);
    
    setProjectDetailsError("");
    setDetailsUpdatePending(false);
  }

  async function updateProjectDetails() {
    if (!projectTitle)
    {
        setProjectDetailsError("Please give your project a title");
        return;
    }

    try {
        setDetailsLoading(true);
        setProjectDetailsError("");

        const { error: updateError } = await supabase
        .from("projects")
        .update({
          title: projectTitle,
          description: projectDescription,
          tagline: projectTagline,
          tags: projectTags
        })
        .eq("id", id);

        if (updateError)
        {
            throw updateError;
        }

        setProject(prev => ({ ...prev, title: projectTitle }));

        setDetailsUpdatePending(false);
    } catch (error) {
        setProjectDetailsError(error.message || "An error occured.");
    } finally {
        setDetailsLoading(false);
    }
  }

  async function updateCoverImage() {
    if (!coverImage || !coverUpload)
    {
        return;
    }

    try {
        const timestamp = Date.now();
        setCoverImageLoading(true);
        setCoverImageError("");

        // get old cover path before updating path
        const parts = project?.cover_image.split('/storage/v1/object/public/')[1].split('/');
        parts.shift();
        const oldFilePath = parts.join('/');

        // upload cover
        const coverUrl = await uploadFile(
            "project-covers",
            `${id}/cover-${timestamp}.png`,
            coverUpload
        );

        // update project
        const { error: updateError } = await supabase
        .from("projects")
        .update({
          cover_image: coverUrl,
        })
        .eq("id", id);

        if (updateError) throw updateError;

        // delete old cover
        await supabase.storage.from("project-covers").remove([oldFilePath]);

        setProject(prev => ({ ...prev, cover_image: coverUrl }));
    } catch (error) {
        setCoverImageError(error.message || "An error occured.");
    } finally {
        setCoverImage(null);
        setCoverUpload(null);
        setCoverImageLoading(false);
    }
  }

  async function updateIconImage() {
    if (!iconImage || !iconUpload)
    {
        return;
    }

    try {
        const timestamp = Date.now();
        setIconLoading(true);
        setIconError("");

        // get old icon path before updating path
        const parts = project?.icon.split('/storage/v1/object/public/')[1].split('/');
        parts.shift();
        const oldFilePath = parts.join('/');

        // upload cover
        const iconUrl = await uploadFile(
            "project-icons",
            `${id}/icon-${timestamp}.png`,
            iconUpload
        );

        // update project
        const { error: updateError } = await supabase
        .from("projects")
        .update({
          icon: iconUrl,
        })
        .eq("id", id);

        if (updateError) throw updateError;

        // delete old icon
        await supabase.storage.from("project-icons").remove([oldFilePath]);

        setProject(prev => ({ ...prev, icon: iconUrl }));
    } catch (error) {
        setIconError(error.message || "An error occured.");
    } finally {
        setIconImage(null);
        setIconUpload(null);
        setIconLoading(false);
    }
  }

  const uploadFile = async (bucket, path, file) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

    return (
        <>
            <div className="container">
                <aside className="sidebar bodyFont">
                    <ul>
                        <li className="project-display">
                            <a href={`/project/${project?.id}`}>
                                <img className="pfp-shape" src={project?.icon} alt="Project icon"/>
                                <h2 className="reset titleFont">{project?.title}</h2>
                            </a>
                        </li>
                        
                        <li className="line-break full"><span/></li>

                        <li className="item create-post-button">
                            <FontAwesomeIcon icon={faPlus}/> 
                            Create New Post
                        </li>
                        {items.map((item, index) => (
                            <li key={index} className={`item ${selectedIndex == index ? "selected" : ""}`} onClick={() => {setSelectedIndex(index)}}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                            </li>
                        ))}

                        <li className="line-break"><span/></li>

                        {unlockableItems.map((item, index) => (
                            <li key={index} className={`item ${selectedIndex == (index + items.length) ? "selected" : ""}`} onClick={() => {setSelectedIndex(index + items.length)}}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                            </li>
                        ))}

                        <li className="line-break"><span/></li>

                        <div className="flamepoints-display">
                            <div className="points-title bodyFont">
                                <FontAwesomeIcon icon={faFireFlameCurved} className="icon"/>
                                <span>0 FlamePoints</span>
                            </div>
                            <div className="bar">
                                <div className="background"></div>
                                <div className="fill"></div>
                            </div>
                            <span className="bodyFont caption-size">0 FlamePoints Until Next Upgrade</span>
                            <button className="bodyFont button-shape red-color">
                                Learn More
                            </button>
                        </div>
                    </ul>
                </aside>
                <div className="container-content">
                    <Header isDashboardHeader={true} />

                    <main className="main-content">
                        {selectedIndex < items.length && <h1 className="titleFont">{items[selectedIndex].fullName || items[selectedIndex].name}</h1>}
                        {selectedIndex == 0 && 
                        <div className="content-section details">
                            <div className="section-container details-container">
                                <CappedInput value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} maxLength={30} label="Project Title" id="project-title"></CappedInput>
                                <CappedInput value={projectTagline} onChange={(e) => setProjectTagline(e.target.value)} maxLength={75} label="Project Tagline" id="project-tagline"></CappedInput>
                                <CappedInput value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} maxLength={1500} isTextArea={true} label="Project Description" id="project-description"></CappedInput>
                                <ArrayInputField id="project-tags" array={projectTags} setArray={setProjectTags} label="Project Tags (Max maxArrayCount)" maxArrayCount={5}></ArrayInputField>
                                {projectDetailsError && <p className="bodyFont error-message">{projectDetailsError}</p>}
                                {detailsUpdatePending && <div className="optionsDiv">
                                    <button className="cancel button-shape bodyFont" disabled={detailsLoading} onClick={() => resetProjectDetails()}>Cancel</button>
                                    <button className="button-shape bodyFont red-color" onClick={() => updateProjectDetails()} disabled={detailsLoading}>{detailsLoading ? "Saving..." : "Save"}</button>
                                </div>}
                            </div>
                            <div className="line-break"/>
                            <div className="section-container cover-image">
                                <span className="bodyFont">Cover Image</span>
                                <div className="fileAndImage cover-image">
                                    <img src={coverImage || project?.cover_image} className="sixteennine"/>
                                    <input type="file" accept="image/*" className="bodyFont input-field" onChange={handleCoverChange} ref={coverImageInputRef} />
                                </div>
                                {coverImage && <div className="optionsDiv">
                                    <button className="cancel button-shape bodyFont" disabled={coverImageLoading} onClick={() => removeCoverImage()}>Cancel</button>
                                    <button className="button-shape bodyFont red-color" onClick={() => updateCoverImage()} disabled={coverImageLoading}>{coverImageLoading ? "Saving..." : "Save"}</button>
                                </div>}
                            </div>
                            {coverImageError && <p className="bodyFont error-message">{coverImageError}</p>}
                            <div className="line-break"/>
                            <div className="section-container preview-images">
                                <span className="bodyFont">Project Logo</span>
                                <div className="fileAndImage project-icon">
                                    <img className="pfp-shape" src={iconImage || project?.icon}/>
                                    <input type="file" accept="image/*" className="bodyFont input-field pfp-shape" onChange={handleIconChange} ref={iconImageInputRef} />
                                </div>
                                {iconImage && <div className="optionsDiv">
                                    <button className="cancel button-shape bodyFont" onClick={() => removeIconImage()} disabled={iconLoading}>Cancel</button>
                                    <button className="button-shape bodyFont red-color" onClick={() => updateIconImage()} disabled={iconLoading}>{iconLoading ? "Saving..." : "Save"}</button>
                                </div>}
                            </div>
                            {iconError && <p className="bodyFont error-message">{iconError}</p>}
                            <div className="line-break"/>
                            <div className="section-container preview-images">
                                <PreviewImagesContainer previewImages={previewImages} setPreviewImages={setPreviewImages} previewUpload={previewUpload} setPreviewUpload={setPreviewUpload}/>
                                {previewImagesError && <p className="bodyFont error-message">{previewImagesError}</p>}
                                {previewImagesUpdatePending && <div className="optionsDiv">
                                    <button className="cancel button-shape bodyFont" disabled={previewImagesLoading}>Cancel</button>
                                    <button className="button-shape bodyFont red-color" disabled={previewImagesLoading}>{previewImagesLoading ? "Saving..." : "Save"}</button>
                                </div>}
                            </div>
                        </div>
                        }
                        {selectedIndex == 1 && 
                        <div className="content-section analytics">
                            <div className="dashboard-grid">
                                <DashboardCard title="Views" value="10000" className="full" />
                                <DashboardCard title="Supporters" value="2000" className="full" />
                                <DashboardCard title="Total Posts" value="20" className="medium" />
                                <DashboardCard title="Total Likes" value="0" className="medium" />
                                <DashboardCard title="Average Post Interval" value="0" className="medium" />
                                <DashboardCard title="Like-Dislike Ratio" value="0" className="medium" />
                            </div>
                        </div>
                        }
                        {selectedIndex == 2 && 
                        <div className="content-section posts">
                        </div>
                        }
                        {selectedIndex > items.length - 1 && 
                        <div className="content-section locked">
                            <h2 className="title">This Feature Hasn’t Been Released Yet</h2>
                            <p className="body">Something about becoming a member</p>
                            <FontAwesomeIcon icon={faLock} className="label-color icon"/>
                        </div>
                        }
                    </main>
                </div>
            </div>
        </>
    )
}