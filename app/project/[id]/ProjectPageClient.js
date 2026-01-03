"use client"
import Header from "@/components/Header";
import ErrorComponent from "@/components/ErrorComponent"
import { useState, useEffect, useRef } from "react";
import { getProject, getUser, joinProject, leaveProject, ratePost } from "@/lib/projectFunctions";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import '@/lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";
import { createPost, fetchPosts, uploadPostFile, deletePostFile, extractYouTubeId } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faCircleXmark, faPlus, faDiamond, faStar, faClock, faHourglass, faLayerGroup, faListCheck, faTimeline, faGlobe, faHome, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faT, faImage, faVideo, faVolumeLow, faPoll, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import "@/styles/project.css"
import "@/styles/ProjectPost.css";
import "@/styles/projectCreatePanel.css"
import ProjectPost from "@/components/ProjectPost";
import SignupNotice from "@/components/SignupNotice.jsx";
import { Paginator } from "@/lib/paginator";
import CappedInput from "@/components/CappedInput";
import InfiniteScroll from "@/lib/infinitePostFeed";
import PanelOverlay from "@/components/PanelOverlay";

export default function ProjectPage({ project, isOwner, hasJoined, initialPosts, otherProjects, filters = ["Recent", "Oldest", "Top"], pageSize = 10 }) {
    const [projectPosts, setProjectPosts] = useState(initialPosts);
    const [fetchPage, setFetchPage] = useState(initialPosts?.length > 0 ? 0 : -1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const filterIcons = [faClock, faHourglass, faStar];
    const [selectedFilter, setSelectedFilter] = useState(0);
    const fromFilterChange = useRef(false); // to prevent double fetching on intial filter change
    const pages = ["Posts", "To-Do List", "Timeline", "Community"];
    const pageIcons = [faLayerGroup, faListCheck, faTimeline, faGlobe];
    const [selectedPage, setSelectedPage] = useState(0);
    const [creationError, setCreationError] = useState("");
    const [creatingPost, setCreatingPost] = useState(false);
    const [leaveProjectPanelOpen, setLeaveProjectPanelOpen] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [hasJoinedState, setHasJoined] = useState(hasJoined);
    const [mobilePanelIndex, setMobilePanelIndex] = useState(0);
    const mobileNavRef = useRef(null);
    const { user, userSet } = useUser();
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [leaveMessage, setLeaveMessage] = useState(getRandomLeaveMessage());
    const [showSignupNotice, setShowSignupNotice] = useState(false);

    const fetchPostsFunction = async (page) => {
        const posts = await fetchPosts(id, page, pageSize, filters[selectedFilter]);

        setProjectPosts((prevPosts) => [...prevPosts, ...posts]);

        if (posts.length < pageSize) {
            setHasMore(false);
        }

        return posts;
    };

    useEffect(() => {
        const logView = async () => {
            if (!id)
            {
                return;
            }

            const { error } = await supabase.rpc('log_project_view', {
                p_project_id: id,
            });
        };

        logView();
    }, [id]);

    // Close mobile panels (select Home) when clicking outside the mobile nav
    useEffect(() => {
        function handleClickOutside(e) {
            if (mobilePanelIndex === 2 || mobilePanelIndex === 3) {
                const nav = mobileNavRef.current;
                if (nav && !nav.contains(e.target)) {
                    setMobilePanelIndex(0);
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobilePanelIndex]);

    const setFilter = (index) => {
        if (index < 0 || index >= filters.length){
            return;
        }

        const same = index == selectedFilter;

        if (same)
        {
            return;
        }

        window.scrollTo(0, 0);

        setLoading(true);
        fromFilterChange.current = true;
        setSelectedFilter(index);
    }


    useEffect(() => {
        const handleFilter = async () => {
            if (!fromFilterChange.current) {
                return;
            }

            fromFilterChange.current = false;
            
            setProjectPosts([]);
            setFetchPage(0);
            setHasMore(true);

            const newPosts = await fetchPosts(id, 0, pageSize, filters[selectedFilter]);

            setProjectPosts(newPosts);

            if (newPosts.length < pageSize) {
                setHasMore(false);
            }

            setLoading(false);
        }

        handleFilter();
    }, [selectedFilter]);

    
    const setPage = (index) => {
        if (index < 0 || index >= pages.length){
            return;
        }

        const same = index == selectedPage;

        if (same)
        {
            return;
        }

        window.scrollTo(0, 0);

        setSelectedPage(index);
    }

    async function SetPinned(post) {
        try {
            setUpdateItem(null);
            let pinned = !post.is_pinned;
            const { error } = await supabase
            .from("posts")
            .update({
                is_pinned: pinned,
                pinned_at: pinned ? new Date().toISOString() : null
            })
            .eq("id", post.id);

            if (error) throw error;

            post.is_pinned = pinned;
            post.pinned_at = pinned ? new Date().toISOString() : null;

            setUpdateItem(post);
        } catch (error) {

        } finally {

        }
    }

    async function rateProjectPost(post, userId, value)
    {
        if (!userId) {
            setShowSignupNotice(true);
            return;
        }
        
        try {
            await ratePost(post.id, userId, value);
        } catch (err) {
            if (err.notLoggedIn)
            {
                window.location.href = "/login";
            }
        }
    }

    const [panelOpen, SetPanelOpen] = useState(false);
    const [creationSelectionIndex, setCreationSelectionIndex] = useState(0);
    const [postMainTypeIndex, setPostMainTypeIndex] = useState(0);
    const postTypes = [
        {name: "Text", icon: faT, id: "text"},
        {name: "Image", icon: faImage, id: "image"},
        {name: "Poll", icon: faPoll, id: "poll"},
        {name: "Audio", icon: faVolumeLow, id: "audio"},
        {name: "Video", icon: faVideo, id: "video"},
        {name: "Link", icon: faLink, id: "link"},
    ]
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [posts, setPosts] = useState([
        {postTitle: "", postDescription: "", postType: "text", textContent: "", imageContent: [], pollContent: [], audioContent: null, videoContent: "", linkContent: []},
        // imageContent = [ { image (url), imageUpload (file) } ] 
        // audioContent = { audio (url), audioUpload (file) }
    ]);
    const [currentPollText, setCurrentPollText] = useState("");

    useEffect(() => {
        setCreationError("");
    }, [creationSelectionIndex, postMainTypeIndex, currentPostIndex])

    const MAX_POST_IMAGES = 3;
    const MAX_POLL_OPTIONS = 4;
    const MAX_LINKS = 5;
    const MAX_MULTIPOST_SECTIONS = 3;

    const setPostTitle = (title) => {
        const updatedPosts = [...posts];
        updatedPosts[currentPostIndex] = {
            ...updatedPosts[currentPostIndex],
            postTitle: title,
        };
        setPosts(updatedPosts);
    }

    const setPostDescription = (desc) => {
        const updatedPosts = [...posts];
        updatedPosts[currentPostIndex] = {
            ...updatedPosts[currentPostIndex],
            postDescription: desc,
        };
        setPosts(updatedPosts);
    }

    const setPostType = (type) => {
        const updatedPosts = [...posts];
        updatedPosts[currentPostIndex] = {
            ...updatedPosts[currentPostIndex],
            postType: type,
        };
        setPosts(updatedPosts);
    }

    const addNewPostSection = () => {
        if (posts?.length >= MAX_MULTIPOST_SECTIONS)
        {
            return;
        }

        const newPost = {postTitle: "", postDescription: "", postType: "text", textContent: "", imageContent: [], pollContent: [], audioContent: null, videoContent: "", linkContent: []}
        setPosts(prevPosts => [...prevPosts, newPost]);
    }

    const removePostSection = (index) => {
        if (currentPostIndex == index) {
            setCurrentPostIndex(posts.length - 2);
        }
        
        setPosts(prevPosts => prevPosts.filter((_, i) => i !== index));
    }

    const handlePostImageChange = (e, postIndex) => {
        if (e.target.files) {
                const newFiles = Array.from(e.target.files);

                const newEntries = newFiles.map((file) => ({
                image: URL.createObjectURL(file),
                imageUpload: file,
            }));

            setPosts((prevPosts) => {
                const updatedPosts = [...prevPosts];
                const targetPost = updatedPosts[postIndex];

                const combined = [...targetPost.imageContent, ...newEntries].slice(
                    0,
                    MAX_POST_IMAGES
                );

                updatedPosts[postIndex] = {
                    ...targetPost,
                    imageContent: combined,
                };

                return updatedPosts;
            });
        }
    };

    const handleRemovePostImage = (postIndex, imgIndex) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[postIndex];

            // Clean up object URL
            URL.revokeObjectURL(targetPost.imageContent[imgIndex].image);

            updatedPosts[postIndex] = {
            ...targetPost,
            imageContent: targetPost.imageContent.filter((_, i) => i !== imgIndex),
            };

            return updatedPosts;
        });
    };

    const addNewPollOption = (text) => {
        if (text == "" || text == null)
        {
            return;
        }

        if (posts[currentPostIndex].length > MAX_POLL_OPTIONS)
        {
            return;
        }

        const updatedPosts = [...posts];

        updatedPosts[currentPostIndex] = {
            ...updatedPosts[currentPostIndex],
            pollContent: [
            ...updatedPosts[currentPostIndex].pollContent,
            text,
            ],
        };

        setPosts(updatedPosts);
        setCurrentPollText("");
    }

    const removePollOption = (index) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[currentPostIndex];

            updatedPosts[currentPostIndex] = {
            ...targetPost,
            pollContent: targetPost.pollContent.filter((_, i) => i !== index),
            };

            return updatedPosts;
        });
    }

    const handleAudioChange = (e, postIndex) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newUrl = URL.createObjectURL(file);

            setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[postIndex];

            // Revoke old audio URL if it exists
            if (targetPost.audioContent?.audio) {
                URL.revokeObjectURL(targetPost.audioContent.audio);
            }

            updatedPosts[postIndex] = {
                ...targetPost,
                audioContent: {
                audio: newUrl,
                audioUpload: file,
                },
            };

            return updatedPosts;
            });
        }
    };

    const addLink = (postIndex) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[postIndex];

            updatedPosts[postIndex] = {
            ...targetPost,
            linkContent: [...targetPost.linkContent, {name: "New Link", url: "https://"}],
            };

            return updatedPosts;
        });
    };

    const removeLink = (postIndex, linkIndex) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[postIndex];

            updatedPosts[postIndex] = {
            ...targetPost,
            linkContent: targetPost.linkContent.filter((_, i) => i !== linkIndex),
            };

            return updatedPosts;
        });
    };

    const updateLink = (postIndex, linkIndex, field, value) => {
        setPosts((prevPosts) => {
            const updatedPosts = [...prevPosts];
            const targetPost = updatedPosts[postIndex];

            const updatedLinks = targetPost.linkContent.map((link, i) =>
            i === linkIndex ? { ...link, [field]: value } : link
            );

            updatedPosts[postIndex] = {
            ...targetPost,
            linkContent: updatedLinks,
            };

            return updatedPosts;
        });
    };

    const cancelCreation = () => {
        setCurrentPostIndex(0);
        setPostMainTypeIndex(0);
        setPosts([{postTitle: "", postDescription: "", postType: "text", textContent: "", imageContent: [], pollContent: [], audioContent: null, videoContent: "", linkContent: []}]);
    }

    const createSinglePost = async () => {
        setCreationError("");
        setCreatingPost(true);
        let FilePaths = [];
        try {
            const post = posts[0];

            const { contentObject, filePaths } = await handlePostContent(post);
            FilePaths = filePaths;

            if (post.postType == null || post.postType == "")
            {
                throw new Error("Post content error");
            }

            if (contentObject == null)
            {
                throw new Error("Post content error");
            }

            await createPost(id, post.postTitle, post.postDescription, [ contentObject ], false);
            window.location.reload();
        } catch (error)
        {
            for (const path of FilePaths) {
                try {
                    await deletePostFile(path);
                } catch (deleteError) {

                }
            }

            setCreationError(error.message);
            setCreatingPost(false);
        } finally {

        }
    }

    const createMultiPost = async () => {
        setCreationError("");
        setCreatingPost(true);
        let FilePaths = [];
        let contentObjects = [];

        try {
            if (posts.length == 0)
            {
                throw new Error("No posts to create");
            }

            const postName = posts[0].postTitle;
            const postDescription = posts[0].postDescription;
            
            for (let i = 0; i < posts.length; i++)
            {
                const post = posts[i];
                const { contentObject, filePaths } = await handlePostContent(post);
                FilePaths.push(filePaths);

                if (post.postType == null || post.postType == "")
                {
                    throw new Error("Post content error");
                }

                if (contentObject == null)
                {
                    throw new Error("Post content error");
                }

                contentObjects.push(contentObject);
            }

            if (contentObjects.length == 0)
            {
                throw new Error("No posts to create");
            }

            await createPost(id, postName, postDescription, contentObjects, false);
            window.location.reload();
        } catch (error)
        {
            for (const path of FilePaths) {
                try {
                    await deletePostFile(path);
                } catch (deleteError) {

                }
            }

            setCreationError(error.message);
            setCreatingPost(false);
        } finally {

        }
    }

    const handlePostContent = async (post) => {
        let content = { contentType: "", content: null };
        let rollbackPaths = [];

        try {
            if (post.postType == "text")
            {
                content.contentType = post.postType
                content.content = post.textContent;
            } else if (post.postType == "image") 
            {
                content.contentType = post.postType;

                const uploadedUrls = [];
                for (const image of post.imageContent) {
                    const { uploadedUrl, filePath } = await uploadPostFile(image.imageUpload, id, 2, `The image '${image.imageUpload.name}' is too large. The maximum upload size for an image is 2MB.`);
                    uploadedUrls.push(uploadedUrl);
                    rollbackPaths.push(filePath);
                }

                content.content = uploadedUrls;
            } else if (post.postType == "poll") {
                content.contentType = post.postType;
                
                // let the createPost function handle it

                content.content = post.pollContent;                
            } else if (post.postType == "audio") {

                if (post.audioContent?.audioUpload == null)
                {
                    throw new Error("No audio file. Please upload an audio file to create your post.");
                }

                content.contentType = post.postType;
                
                const { uploadedUrl, filePath } = await uploadPostFile(post.audioContent.audioUpload, id, 5, "The audio file exceeds the maximum size limit of 5MB.");
                content.content = uploadedUrl;
                rollbackPaths.push(filePath);
            } else if (post.postType == "video") {
                content.contentType = post.postType;

                if (!post.videoContent){
                    throw new Error("Please input a YouTube link");
                }

                content.content = post.videoContent;
            } else if (post.postType == "link") {
                content.contentType = post.postType;

                if (!post.linkContent)
                {
                    throw new Error("Post content error");
                }

                if (post.linkContent.length <= 0)
                {
                    throw new Error("No links. Please include at least 1 link in your post.");
                }

                for (const link of post.linkContent)
                {
                    if (!checkURLStart(link.url))
                    {
                        throw new Error("Please ensure each URL starts with https:// or http://");
                    }

                    if (!checkURLAfter(link.url))
                    {
                        throw new Error("Please ensure each URL is a valid URL");
                    }
                }

                content.content = post.linkContent;
            }
        } catch (error) {
            // rollback urls
            for (const path of rollbackPaths) {
                try {
                    await deletePostFile(path);
                } catch (deleteError) {
                    // console.error("Rollback failed for", url, deleteError);
                }
            }

            throw (error);
        }

        return { contentObject: content, filePaths: rollbackPaths }
    }

    function checkURLStart(url) {
        if (!url)
        {
            return false;
        }

        const hasHttp = /^https?:\/\//i.test(url);

        return hasHttp;
    }

    function checkURLAfter(url){
        try {
            const parsedUrl = new URL(url);
            // Basic check: hostname should have at least one dot (.)
            return parsedUrl.hostname.includes('.');
        } catch {
            return false;
        }
    }

    function setOrResetMobilePanelIndex(index) {
        if (mobilePanelIndex == index)
        {
            setMobilePanelIndex(0);
            return;
        }

        setMobilePanelIndex(index);
    }

    async function JoinProject() {
        if (!user)
        {
            setShowSignupNotice(true);
            return;
        }

        try {
            setIsJoining(true);
            await joinProject(user?.id, id);
            setHasJoined(true);
        } catch (error)
        {
            setIsJoining(false);
        }
    }

    function getRandomLeaveMessage() {
        const messages = [
            "It won’t be the same without you!",
            "Your presence makes all the difference!",
            "We’d love for you to be part of this journey!",  
            "It’s people like you who make this possible!",
            "Thanks for believing in what we’re creating!",
            "You’re helping make something special happen!",
            "Together, we can create something amazing.",
            "The journey is more fun when shared.",
            "Thank you for being part of the journey so far!",
            "We’re grateful for every moment you share with us!"
        ];

        const index = Math.floor(Math.random() * messages.length);
        return messages[index];
    }

    async function LeaveProjectFunction() {
        try {
            setIsLeaving(true);
            await leaveProject(user?.id, id);
            router.push("/");
        } catch {
            setIsLeaving(false);
        }
    }

    return (
        <div className="project-page">
            <Header/>
            <div className="container">
                <main className="main">
                    <div className="sections">
                        <div className="side">
                            <div className="card bodyFont side-filters">
                                <span className="titleFont cardTitle bold">Sort By</span>
                                {filters.map((filter, index) => (
                                    <div key={index} onClick={() => setFilter(index)} className={`no-select-pointer filter ${selectedFilter === index ? "selected" : "label-color"}`}>
                                        <FontAwesomeIcon className="icon" icon={filterIcons[index]}/>
                                        <span className="bodyFont">{filter}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card bodyFont side-filters">
                                {pages.map((page, index) => (
                                    <div key={index} onClick={() => setPage(index)} className={`no-select-pointer filter ${selectedPage === index ? "selected" : "label-color"}`}>
                                        <FontAwesomeIcon className="icon" icon={pageIcons[index]}/>
                                        <span className="bodyFont">{page}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="posts">
                            <div className="topbar">
                                <div className="project-info">
                                    <img className="project-icon" src={project?.icon}/>
                                    <h1 className="titleFont title-size">{project?.title}</h1>
                                </div>
                                {isOwner && 
                                <div className="project-actions">
                                    <button className="button-shape titleFont create-post" onClick={() => {SetPanelOpen(true)}}>Create Post</button>
                                </div>}
                            </div>
                            <div className="posts-container">
                                <Paginator
                                    page={fetchPage}
                                    setPage={setFetchPage}
                                    items={projectPosts}
                                    setItems={setProjectPosts}
                                    fetchFunction={fetchPostsFunction}
                                    loading={loading}
                                    setLoading={setLoading}
                                    hasMore={hasMore}
                                    setHasMore={setHasMore}
                                    projectId={id}
                                    renderItem={(post, idx) => (
                                      <ProjectPost key={idx || post.id} projectId={id} postId={post.id} icon={project?.icon} postTitle={post.title} postDescription={post.description} postContent={post.content} dateCreated={post.created_at} isOwner={isOwner} isPinned={post.is_pinned} wasEdited={post.was_edited} setPinnedFunction={() => SetPinned(post)} rateFunction={rateProjectPost.bind(null, post, user?.id)}></ProjectPost>  
                                    )}
                                    noneFoundMessage={isOwner ? "No posts yet. Create a post to get started!" : "No posts yet. Stay tuned to support the creator and view their progress!"}
                                    />
                            </div>
                        </div>
                        <div className={`side-section desktop`}>
                            <div className="card bodyFont description-card">
                                <h2 className="titleFont cardTitle">Project Description</h2>
                                <span className="description">{project?.description}</span>
                                <div className="actions">
                                    {(!isOwner && (hasJoined || hasJoinedState)) && <button className="button-shape bodyFont button-red-harsh" onClick={() => {setLeaveMessage(getRandomLeaveMessage()); setLeaveProjectPanelOpen(true)}}>Leave Project</button>}
                                    {(!isOwner && !(hasJoined || hasJoinedState)) && <button className="button-shape bodyFont button-red" onClick={() => JoinProject()} disabled={isJoining}>{isJoining ? "Joining..." : "Join Project"}</button>}
                                    {(isOwner) && <a href={`/project/${id}/dashboard`}><button className="button-shape bodyFont button-yellow">Project Dashboard</button></a>}
                                </div>
                            </div>
                            <div className="card other bodyFont">
                                <span className="titleFont cardTitle bold">Other Projects</span>
                                {otherProjects.map((project, i) => (
                                <a className="project-span" href={`/project/${project.id}/preview`} target="_blank" key={i}>
                                    <img className="pfp-shape" alt="project icon" src={project.icon}></img>
                                    <div className="side-project-info">
                                        <span className="titleFont bold">{project.title}</span>
                                        <span className="caption-size"><i>{project.tagline}</i></span>
                                    </div>
                                </a>
                                ))}
                            </div>
                        </div>
                        <div className={`side-section mobile-target${mobilePanelIndex == 1 ? " mobile" : " hide"}`}>
                            <div className="card bodyFont description-card">
                                <h2 className="titleFont cardTitle">Project Description</h2>
                                <span className="description">{project?.description}</span>
                                <div className="actions">
                                    {(!isOwner && (hasJoined || hasJoinedState)) && <button className="button-shape bodyFont button-red-harsh" onClick={() => {setLeaveMessage(getRandomLeaveMessage()); setLeaveProjectPanelOpen(true)}}>Leave Project</button>}
                                    {(!isOwner && !(hasJoined || hasJoinedState)) && <button className="button-shape bodyFont button-red" onClick={() => JoinProject()} disabled={isJoining}>{isJoining ? "Joining..." : "Join Project"}</button>}
                                    {isOwner && <a href={`/project/${id}/dashboard`}><button className="button-shape bodyFont button-yellow">Project Dashboard</button></a>}
                                </div>
                            </div>
                            <div className="card other bodyFont">
                                <span className="titleFont cardTitle bold">Other Projects</span>
                                {otherProjects.map((project, i) => (
                                <a className="project-span" href={`/project/${project.id}/preview`} target="_blank" key={i}>
                                    <img className="pfp-shape" alt="project icon" src={project.icon}></img>
                                    <div className="side-project-info">
                                        <span className="titleFont bold">{project.title}</span>
                                        <span className="caption-size"><i>{project.tagline}</i></span>
                                    </div>
                                </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <div className="mobile-nav bodyFont" ref={mobileNavRef}>
                    <div className={`section${mobilePanelIndex == 0 ? " current" : ""}`} onClick={() => setMobilePanelIndex(0)}>
                        <FontAwesomeIcon icon={faHome} />
                        <span className="caption-size">Home</span>
                    </div>
                    <div className={`section${mobilePanelIndex == 1 ? " current" : ""}`} onClick={() => setOrResetMobilePanelIndex(1)}>
                        <FontAwesomeIcon icon={faCircleInfo} />
                        <span className="caption-size">About</span>
                    </div>
                    <div className={`section${mobilePanelIndex == 2 ? " current" : ""}`} onClick={() => setOrResetMobilePanelIndex(2)}>
                        <FontAwesomeIcon icon={filterIcons[selectedFilter]} />
                        <span className="caption-size">{filters[selectedFilter]}</span>
                        {mobilePanelIndex == 2 && 
                        <div className="selection-panel">
                        {filters.map((filter, index) => (
                            (filter !== filters[selectedFilter]) && 
                            <div key={index} onClick={() => { setFilter(index); }} className={`no-select-pointer filter ${selectedFilter === index ? "selected" : "label-color"}`}>
                                <FontAwesomeIcon className="icon" icon={filterIcons[index]}/>
                                <span className="bodyFont">{filter}</span>
                            </div>
                        ))}
                        </div> }
                    </div>
                    <div className={`section${mobilePanelIndex == 3 ? " current" : ""}`}>
                        <div className="section-wrapper" onClick={() => setOrResetMobilePanelIndex(3)}>
                            <FontAwesomeIcon icon={pageIcons[selectedPage]} />
                            <span className="caption-size">{pages[selectedPage]}</span>
                        </div>
                        {mobilePanelIndex == 3 && 
                        <div className="selection-panel">
                        {pages.map((page, index) => (
                            (page !== pages[selectedPage]) && <div key={index} onClick={() => setPage(index)} className={`no-select-pointer filter ${selectedPage === index ? "selected" : "label-color"}`}>
                                <FontAwesomeIcon className="icon" icon={pageIcons[index]}/>
                                <span className="bodyFont">{page}</span>
                            </div>
                        ))}
                        </div>}
                    </div>
                </div>
                {panelOpen &&
                <div className="create-panel">
                    <div className="backdrop"></div>
                    <div className="panel-content">
                        <FontAwesomeIcon icon={faCircleXmark} className="close-button bodyFont no-select-pointer" onClick={() => SetPanelOpen(false)}/>
                        <div className="top-section">
                            <h2 className="bodyFont reset">Create Post</h2>
                            <div className="post-options">
                                <span className={`bodyFont label-color no-select-pointer ${creationSelectionIndex == 0 ? "selected" : ""}`} onClick={() => {setCreationSelectionIndex(0); setCurrentPostIndex(0);}}>Post</span>
                                {false && <span className={`bodyFont label-color no-select-pointer ${creationSelectionIndex == 1 ? "selected" : ""}`} onClick={() => setCreationSelectionIndex(1)}>Multipost</span>}
                            </div>
                        </div>

                        <div className="content">
                        {creationSelectionIndex == 1 &&
                            <div className="multipost-manager bodyFont">
                                <div className="top bold">
                                    <span>Post Sections</span>
                                </div>
                                <div className="post-sections">
                                    {posts.map((post, i) => (
                                        <span
                                        key={i}
                                        className={`label-color no-select-pointer ${currentPostIndex == i ? "selected" : ""}`}
                                        onClick={() => {setCurrentPostIndex(i); setPostMainTypeIndex(postTypes.findIndex(type => type.id === post.postType))}}>Post {(i + 1)}</span>
                                    ))}
                                    { posts.length < MAX_MULTIPOST_SECTIONS && <span className="label-color no-select-pointer bold mt" onClick={() => addNewPostSection()}>Add New</span> }
                                </div>
                            </div>
                        }
                            <div className="create-content">
                                <div className="post-type-options bodyFont">
                                    {postTypes.map((type, i) => (
                                    <div
                                    key={i}
                                    className={`option label-color no-select-pointer ${postMainTypeIndex == i ? "selected" : ""}`}
                                    onClick={() => {setPostMainTypeIndex(i); setPostType(type.id);}}>
                                        <FontAwesomeIcon icon={type.icon}/>
                                    </div>
                                    ))}
                                </div>
                                <div className="create-actions">
                                    <div className="creation-container">
                                        <h2 className="titleFont reset">{postTypes[postMainTypeIndex].name} Post{(creationSelectionIndex == 1 && currentPostIndex != 0) ? ` (Section ${currentPostIndex + 1})`: ""}</h2>
                                        {(creationSelectionIndex == 0 || (creationSelectionIndex == 1 && currentPostIndex == 0)) &&
                                        <>
                                        <CappedInput label="Post Title" maxLength={100} value={posts[currentPostIndex].postTitle} onChange={(e) => setPostTitle(e.target.value)} id="post-name"/>
                                        <CappedInput label="Post Description" maxLength={200} value={posts[currentPostIndex].postDescription} onChange={(e) => setPostDescription(e.target.value)} id="post-description"/>
                                        </>}

                                        <CappedInput className={`${posts[currentPostIndex].postType == "text" ? "" : "hide"}`} label="Text Content" maxLength={1500} value={posts[currentPostIndex].textContent} 
                                        onChange={(e) => {
                                        const updatedPosts = [...posts];
                                        updatedPosts[currentPostIndex] = {
                                            ...updatedPosts[currentPostIndex],
                                            textContent: e.target.value,
                                        };
                                        setPosts(updatedPosts);
                                        }} id="post-content-text" isTextArea={true}/>

                                        <div className={`${posts[currentPostIndex].postType == "image" ? "" : "hide"} Image-Post-Field`}>
                                            <label className={`bodyFont`}>Images (up to {MAX_POST_IMAGES})</label>
                                            {posts[currentPostIndex].imageContent.length > 0 && <span className="label-color bodyFont">{posts[currentPostIndex].imageContent.length} {posts[currentPostIndex].imageContent.length != 1 ? "Images" : "Image"}</span>}
                                            <div className="image-file-field">
                                                <input type="file" accept=".jpg,.jpeg,.png,.webp,.avif,.gif" className="bodyFont input-field" multiple onChange={(e) => {handlePostImageChange(e, currentPostIndex)}} />
                                            </div>
                                            <span className="label-color bodyFont caption-size">{posts[currentPostIndex].imageContent.length} / {MAX_POST_IMAGES} images</span>
                                            <div className="postImages">
                                                {posts[currentPostIndex].imageContent.map((content, i) => (
                                                <div key={i} className="postImageContainer">
                                                    <img src={content.image} alt={`Image ${i}`} className={`postImage sixteennine`} />
                                                    <button className="bodyFont button-shape" onClick={() => {handleRemovePostImage(currentPostIndex, i)}}>Remove</button>
                                                </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`poll-creator ${posts[currentPostIndex].postType == "poll" ? "" : "hide"}`}>
                                            <CappedInput className="poll-creator-input" label={`Poll Options (Max ${MAX_POLL_OPTIONS})`} hideCounter={true} maxLength={50} value={currentPollText} onChange={(e) => setCurrentPollText(e.target.value)} id="post-poll-text">
                                            {posts[currentPostIndex].pollContent.length < MAX_POLL_OPTIONS && <button className="add-button no-select-pointer" onClick={() => {addNewPollOption(currentPollText)}}><FontAwesomeIcon icon={faPlus}/></button> }
                                            </CappedInput>
                                            <span className="label-color bodyFont caption-size">{posts[currentPostIndex].pollContent.length} / {MAX_POLL_OPTIONS} options</span>
                                            <div className="poll-options-container">
                                                {posts[currentPostIndex].pollContent.map((content, i) => (
                                                <div key={i} className="poll-option">
                                                    <span className="bodyFont">{content}</span>
                                                    <FontAwesomeIcon className="no-select-pointer remove" onClick={() => {removePollOption(i)}} icon={faCircleXmark}/>
                                                </div>
                                                ))}
                                            </div>
                                        </div>

                                        { posts[currentPostIndex].postType == "audio" &&
                                        <div className={`audio-uploader`}>
                                            <label className={`bodyFont`}>Audio Content</label>
                                            <div className="audio-field">
                                                <div className="upload-field no-select-pointer">
                                                    <FontAwesomeIcon className="audio-icon" icon={faFileUpload}/>
                                                    <span className="bodyFont">{posts[currentPostIndex].audioContent?.audioUpload ? "Replace Audio" : "Upload Audio"}</span>
                                                    <input type="file" accept="audio/*" onChange={(e) => handleAudioChange(e, currentPostIndex)}/>
                                                </div>
                                                <div className="audio-display">
                                                    <audio controls src={posts[currentPostIndex].audioContent?.audio}/>
                                                    {posts[currentPostIndex].audioContent?.audioUpload && <label className="label-color bodyFont caption-size file-name">{posts[currentPostIndex].audioContent?.audioUpload.name}</label>}
                                                </div>
                                            </div>
                                        </div>}

                                        { posts[currentPostIndex].postType == "video" &&
                                        <>
                                            <CappedInput className="" label="Youtube Video Link" hideCounter={true} maxLength={500} value={posts[currentPostIndex].videoContent} onChange={(e) => {
                                            const updatedPosts = [...posts];
                                            updatedPosts[currentPostIndex] = {
                                                ...updatedPosts[currentPostIndex],
                                                videoContent: e.target.value,
                                            };
                                            setPosts(updatedPosts);
                                            }} id="post-video-link" />

                                            {posts[currentPostIndex].videoContent != "" && <iframe
                                                className="video-preview"
                                                src={`https://www.youtube.com/embed/${extractYouTubeId(
                                                posts[currentPostIndex].videoContent
                                                )}`}
                                                title="YouTube video preview"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />}
                                        </> 
                                        }

                                        <div className={`links-creator ${posts[currentPostIndex].postType == "link" ? "" : "hide"}`}>
                                            <label className="bodyFont">Links</label>
                                            <div className="links-container">
                                                {posts[currentPostIndex].linkContent.map((content, i) => (
                                                <div key={i} className="link">
                                                    <div className="content">
                                                        <div className="link-properties">
                                                            <div>
                                                                <label className="bodyFont caption-size">Link Name</label>
                                                                <input className="bodyFont input-field" value={content.name} 
                                                                        onChange={(e) =>
                                                                        updateLink(currentPostIndex, i, "name", e.target.value)
                                                                        }/>
                                                            </div>
                                                            <div>
                                                                <label className="bodyFont caption-size">Link URL</label>
                                                                <input className="bodyFont input-field" value={content.url}
                                                                        onChange={(e) =>
                                                                        updateLink(currentPostIndex, i, "url", e.target.value)
                                                                        }/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FontAwesomeIcon className="no-select-pointer remove link-icon" onClick={() => {removeLink(currentPostIndex, i)}} icon={faCircleXmark}/>
                                                </div>
                                                ))}
                                                { posts[currentPostIndex].linkContent?.length < MAX_LINKS && <span className="titleFont label-color bold no-select-pointer" onClick={() => addLink(currentPostIndex)}>Create New Link</span> }
                                            </div>
                                        </div>

                                        {creationError && <p className="error-message bodyFont">{creationError}</p>}
                                    </div>
                                    <div className="actions bodyFont">
                                        <button className="button-shape" onClick={() => { cancelCreation(); SetPanelOpen(false) }}>Cancel</button>
                                        <div className="right">
                                            {(creationSelectionIndex == 1 && posts?.length > 1) && <button className="button-shape remove"onClick={() => {removePostSection(currentPostIndex)}}>Remove Post Section</button>}
                                            <button className="button-shape create" onClick={() => {if (creationSelectionIndex == 0) {createSinglePost()} else if (creationSelectionIndex == 1) {createMultiPost()} }} disabled={creatingPost}>{creatingPost ? "Creating..." : "Create Post"}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
                {selectedPage == 1 &&
                <div className="panel coming-soon-panel">
                    <div className="backdrop" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}></div>
                    <div className="panel-content">
                        <FontAwesomeIcon icon={faCircleXmark} className="close-button bodyFont no-select-pointer" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}/>
                        <h2 className="titleFont title header-size reset">Coming Soon!</h2>
                        <span className="bodyFont bold body">We're currently in beta. Project to-do lists will launch after FlameSpark-Beta gets enough members. Thank you for your support!</span>
                        <div>
                            <a href="https://patreon.com/flamespark" target="_blank"><button className="button-shape patreon-button bodyFont">Become a Member</button></a>
                        </div>
                    </div>
                </div>
                }
                {selectedPage == 2 &&
                <div className="panel coming-soon-panel">
                    <div className="backdrop" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}></div>
                    <div className="panel-content">
                        <FontAwesomeIcon icon={faCircleXmark} className="close-button bodyFont no-select-pointer" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}/>
                        <h2 className="titleFont title header-size reset">Coming Soon!</h2>
                        <span className="bodyFont bold body">We're currently in beta. Project timelines will launch after FlameSpark-Beta gets enough members. Thank you for your support!</span>
                        <div>
                            <a href="https://patreon.com/flamespark" target="_blank"><button className="button-shape patreon-button bodyFont">Become a Member</button></a>
                        </div>
                    </div>
                </div>
                }
                {selectedPage == 3 &&
                <div className="panel coming-soon-panel">
                    <div className="backdrop" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}></div>
                    <div className="panel-content">
                        <FontAwesomeIcon icon={faCircleXmark} className="close-button bodyFont no-select-pointer" onClick={() => {setSelectedPage(0); setMobilePanelIndex(0);}}/>
                        <h2 className="titleFont title header-size reset">Coming Soon!</h2>
                        <span className="bodyFont bold body">We're currently in beta. Project community spaces will launch after FlameSpark-Beta gets enough members. Thank you for your support!</span>
                        <div>
                            <a href="https://patreon.com/flamespark" target="_blank"><button className="button-shape patreon-button bodyFont">Become a Member</button></a>
                        </div>
                    </div>
                </div>
                }
                <PanelOverlay isOpen={leaveProjectPanelOpen} onClose={() => setLeaveProjectPanelOpen(false)} panelClass="panel-content" overlayClass="panel wrapped-panel leave-project-panel">
                    <h2 className="titleFont reset">Are you sure you want to leave <i>{project?.title}</i>?</h2>
                    <span><i>“{leaveMessage}”</i></span>
                    <div className="leave-panel-actions">
                        <button className="button-shape" onClick={() => setLeaveProjectPanelOpen(false)}>Cancel</button>
                        <button className="button-shape button-red-harsh" onClick={() => LeaveProjectFunction()} disabled={isLeaving}>{isLeaving ? "Leaving..." : "Leave Project"}</button>
                    </div>
                </PanelOverlay>
                <SignupNotice
                    isOpen={showSignupNotice}
                    onClose={() => setShowSignupNotice(false)}
                    title="Join the FlameSpark-Beta Community"
                    messageIndex={1}
                />
            </div>
        </div>
    )
}