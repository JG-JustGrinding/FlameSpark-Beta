"use client"
import Header from "@/components/Header";
import Unauthorized from "@/components/Unauthorized";
import ErrorComponent from "@/components/ErrorComponent"
import DashboardCard from "@/components/DashboardCard";
import { useUser } from "@/lib/useUser";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/dashboard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faChartBar, faLayerGroup, faPaintBrush, faList, faNoteSticky, faHeart, faGlobe, faFireFlameCurved, faLock, faL, faKey, faFlag, faStar, faEye, faThumbsUp, faHourglass, faPercent, faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import CappedInput from "@/components/CappedInput";
import ArrayInputField from "@/components/ArrayInputField";
import PreviewImagesContainer from "@/components/PreviewImagesContainer";
import PostsChart from "@/components/PostsChart";
import { formatInterval, getLikeRatio, getProjectAvgPostInterval, getProjectLikeDislikeCounts, getProjectPostCount, getProjectSupporters, getProjectViews, likeRatio, shortenNumber, truncate } from "@/lib/projectFunctions";

export default function ProjectPage(){
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
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
    const [originalPreviewImages, setOriginalPreviewImages] = useState([]);
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
    
    // Analytics
    const [views, setViews] = useState(null);
    const [supporters, setSupporters] = useState(null);
    const [postCount, setPostCount] = useState(null);
    const [totalLikes, setTotalLikes] = useState(null);
    const [totalDislikes, setTotalDislikes] = useState(null);
    const [likeRatio, setLikeRatio] = useState(null);
    const [postInterval, setPostInterval] = useState(null);
    const [postIntervalSet, setPostIntervalSet] = useState(false); // used in case the fetching of postInterval returns null

    const [chartPosts, setChartPosts] = useState([]);
    
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
      setOriginalPreviewImages(mediaData); // need to check to see if the id is defined to tell if the image should be reordered or not

      setLoading(false);
    };

    const fetchProjectAnalytics = async () => {
        if (!id)
        {
            return;
        }

        try {
            const views = await getProjectViews(id);
            setViews(views);
            
            const supporters = await getProjectSupporters(id);
            setSupporters(supporters);

            const totalPosts = await getProjectPostCount(id);
            setPostCount(totalPosts);

            const { likes, dislikes } = await getProjectLikeDislikeCounts(id);
            setTotalLikes(likes);
            setTotalDislikes(dislikes);

            const likeR = getLikeRatio(likes, dislikes);
            setLikeRatio(likeR);

            const postIntrval = await getProjectAvgPostInterval(id);
            setPostInterval(postIntrval);
            setPostIntervalSet(true);
        } catch (error) {

        }
    }

    fetchProject();
    fetchProjectAnalytics();
  }, [id, user, userSet]);


    // Read the tab from URL on initial render
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab !== null) {
            setSelectedIndex(parseInt(tab));
        }
    }, [searchParams]);

    // Update URL when tab changes
    const handleTabClick = (index) => {
        setSelectedIndex(index);
        router.replace(`?tab=${index}`, { scroll: false });
    };

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

  async function updatePreviewImages() {
    try {
        setPreviewImagesLoading(true);
        setPreviewImagesError("");

        // 1. Delete removed images
        const removedImages = originalPreviewImages.filter(orig =>
            !previewUpload.some(upd => upd.id === orig.id)
        );

        for (const img of removedImages) {
            // Remove from storage
            if (img.url) {
                const parts = img.url.split('/storage/v1/object/public/')[1].split('/');
                parts.shift();
                const filePath = parts.join('/');
                await supabase.storage.from("project-media").remove([filePath]);
            }

            if (img.id)
            {
                // Remove from table
                await supabase.from("project_media").delete().eq("id", img.id);
            }
        }
        
        // 2. Upload new images and create table entries
        for (let i = 0; i < previewUpload.length; i++) {
            const img = previewUpload[i];
            if (!img.id && img instanceof File) {
                const timestamp = Date.now();
                const path = `${id}/preview-${timestamp}-${i}.png`;
                const url = await uploadFile("project-media", path, img);
                await supabase.from("project_media").insert({
                project_id: id,
                type: "image",
                url,
                is_preview: true,
                order_index: i,
                });
            } else if (img.id) {
                // 3. Update order of existing images
                await supabase.from("project_media")
                .update({ order_index: i })
                .eq("id", img.id);
            }
        }

        // 4. Refetch and update state
        const { data: mediaData, error: mediaError } = await supabase
        .from("project_media")
        .select("id, url, type, order_index")
        .eq("project_id", id)
        .eq("is_preview", true)
        .order("order_index", { ascending: true });

        if (mediaError) throw mediaError;
        
        setPreviewImages(mediaData);
        setPreviewUpload(mediaData);
        setOriginalPreviewImages(mediaData);
        setPreviewImagesUpdatePending(false);
    } catch {
        setPreviewImagesError(error.message || "An error occurred.");
    } finally {
        setPreviewImagesLoading(false);
    }
  }

  function resetPreviewImages() {
    setPreviewImages(originalPreviewImages);
    setPreviewUpload(originalPreviewImages);
    setPreviewImagesUpdatePending(false);
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
                            <li key={index} className={`item ${selectedIndex == index ? "selected" : ""}`} onClick={() => {handleTabClick(index)}}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                            </li>
                        ))}

                        <li className="line-break"><span/></li>

                        {unlockableItems.map((item, index) => (
                            <li key={index} className={`item ${selectedIndex == (index + items.length) ? "selected" : ""}`} onClick={() => {handleTabClick(index + items.length)}}>
                                <FontAwesomeIcon icon={item.icon} />
                                <span>{item.name}</span>
                                <FontAwesomeIcon className="lock" icon={faLock} />
                            </li>
                        ))}

                        <li className="line-break"><span/></li>

                        <li className={`item ${selectedIndex == (items.length + unlockableItems.length) ? "selected" : ""}`} onClick={() => {handleTabClick(items.length + unlockableItems.length)}}>
                        <FontAwesomeIcon icon={faFlag} />
                        <span>Status</span>
                        </li>

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
                        {selectedIndex == 0 && 
                        <div className="content-section details">
                            <div className="details-header" style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px'}}>
                                <FontAwesomeIcon icon={faPencil} style={{fontSize: '2.5rem', color: 'var(--flamespark-red)'}} />
                                <div>
                                <h2 className="titleFont" style={{margin: 0}}>Project Details</h2>
                                <span className="bodyFont label-color hide">Edit your project's information and showcase images</span>
                                </div>
                            </div>
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
                                <PreviewImagesContainer previewImages={previewImages} setPreviewImages={setPreviewImages} previewUpload={previewUpload} setPreviewUpload={setPreviewUpload} onChanged={() => setPreviewImagesUpdatePending(true)}/>
                                {previewImagesError && <p className="bodyFont error-message">{previewImagesError}</p>}
                                {previewImagesUpdatePending && <div className="optionsDiv">
                                    <button className="cancel button-shape bodyFont" onClick={() => resetPreviewImages()} disabled={previewImagesLoading}>Cancel</button>
                                    <button className="button-shape bodyFont red-color" onClick={() => updatePreviewImages()} disabled={previewImagesLoading}>{previewImagesLoading ? "Saving..." : "Save"}</button>
                                </div>}
                            </div>
                        </div>
                        }
                        {selectedIndex == 1 && 
                        <div className="content-section analytics">
                            <div className="analytics-header" style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px'}}>
                                <FontAwesomeIcon icon={faChartBar} style={{fontSize: '2.5rem', color: 'var(--flamespark-red)'}} />
                                <div>
                                    <h2 className="titleFont" style={{margin: 0}}>Project Analytics</h2>
                                    <span className="bodyFont label-color hide">Track your project’s growth and engagement</span>
                                </div>
                            </div>
                            <div className="dashboard-grid">
                                <DashboardCard title="Supporters" value={supporters} icon={faStar} className="red medium" />
                                <DashboardCard title="Views" value={views} icon={faEye} className="red medium" />
                                <DashboardCard title="Total Posts" value={postCount} icon={faLayerGroup} className="green small" />
                                <DashboardCard title="Total Likes:Dislikes" value={(totalLikes && totalDislikes) ? (`${shortenNumber(totalLikes)} : ${shortenNumber(totalDislikes)}`) : ""} icon={faThumbsUp} secondIcon={faThumbsDown} className="green small" />
                                <DashboardCard title="Like Ratio" value={likeRatio ? `${truncate(likeRatio)}%` : ""} icon={faThumbsUp} secondIcon={faPercent} className="green small" />
                                <DashboardCard title="Avg. Post Interval (Current)" value={formatInterval(postInterval) || (postIntervalSet ? "N/A" : "")} icon={faHourglass} className="green small" />
                            </div>
                            <div className="analytics-chart hide" style={{marginTop: '32px', background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
                                <h3 className="titleFont" style={{marginBottom: '12px'}}>Post Frequency</h3>
                                {/* Placeholder for chart */}
                                <div style={{height: '120px', background: 'linear-gradient(90deg, var(--flamespark-red) 60%, #eee 100%)', borderRadius: '8px'}}></div>
                                <span className="bodyFont label-color" style={{fontSize: '0.9rem'}}>Charts coming soon!</span>
                            </div>
                            <div className="analytics-chart hide" style={{marginTop: '32px', background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'}}>
                                <h3 className="titleFont" style={{marginBottom: '12px'}}>Views Over Time</h3>
                                {/* Placeholder for chart */}
                                <div style={{height: '120px', background: 'linear-gradient(90deg, var(--flamespark-red) 60%, #eee 100%)', borderRadius: '8px'}}></div>
                                <span className="bodyFont label-color" style={{fontSize: '0.9rem'}}>Charts coming soon!</span>
                            </div>
                            <PostsChart projectId={id}/>
                        </div>
                        }
                        {selectedIndex == 2 && 
                        <div className="content-section posts">
                            <div className="posts-header" style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px'}}>
                                <FontAwesomeIcon icon={faLayerGroup} style={{fontSize: '2.5rem', color: 'var(--flamespark-red)'}} />
                                <div>
                                <h2 className="titleFont" style={{margin: 0}}>Project Posts</h2>
                                <span className="bodyFont label-color hide">View and edit your project's posts</span>
                                </div>
                            </div>
                        </div>
                        }
                        {(selectedIndex > items.length - 1 && selectedIndex < items.length + unlockableItems.length) && 
                        <div className="content-section locked" style={{padding: '48px 0', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'}}>
                                <FontAwesomeIcon icon={faLock} className="label-color icon" style={{fontSize: '5rem', color: 'var(--flamespark-red)', marginBottom: '8px'}}/>
                                <h2 className="titleFont bold" style={{fontSize: '2.2rem', margin: 0}}>Feature In Development</h2>
                                <span className="bodyFont label-color" style={{fontSize: '1.1rem', textAlign: 'center', maxWidth: '420px'}}>Thank you for being a member and supporting FlameSpark! This feature is currently in development and will be available soon.<br/>If you’re not a member yet, you can join below.</span>
                            </div>
                            <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                                <button className="button-shape bodyFont red-color" style={{marginTop: '18px', fontSize: '1.1rem', padding: '12px 32px'}}>Become a Member</button>
                            </a>
                        </div>
                        }
                        {selectedIndex == (items.length + unlockableItems.length) && 
                        <div>
                            <div className="content-section status">
                                <div className="status-header" style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px'}}>
                                    <FontAwesomeIcon icon={faFlag} style={{fontSize: '2.5rem', color: 'var(--flamespark-red)'}} />
                                    <div>
                                    <h2 className="titleFont" style={{margin: 0}}>Project Status</h2>
                                    <span className="bodyFont label-color hide">Edit your project's status</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </main>
                </div>
            </div>
        </>
    )
}