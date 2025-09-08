"use client"
import Header from "@/components/Header";
import ErrorComponent from "@/components/ErrorComponent"
import { useState, useEffect } from "react";
import { getProject } from "@/lib/projectFunctions";
import { useParams } from "next/navigation";
import '@/lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { isUserOwner, createPost } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { faT, faImage, faVideo, faVolumeLow, faPoll } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import "@/styles/project.css"
import "@/styles/projectCreatePanel.css"
import Carousel from "@/components/Carousel";
import CappedInput from "@/components/CappedInput";

export default function ProjectPage(){
    const [project, setProject] = useState(null);
    const [error, setError] = useState(false);
    const [creationError, setCreationError] = useState("");
    const [creatingPost, setCreatingPost] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const { user } = useUser();
    const { id } = useParams();

    useEffect(() => {
        async function run(){
            try {
                const value = await getProject(id);
                setProject(value);
            } catch (error) {
                console.log(error.message);
                setError(true);
            }
        }
        run();
    }, [id]);

    if (error){
        return (
            <>
                <ErrorComponent/>
            </>
        )
    }

    useEffect(() => {
        const checkIsOwner = async () => {
            if (user == null){
                setIsOwner(false);
                return;
            }

            try {
                const isTheUserAnOwner = await isUserOwner(user.id, id);
                setIsOwner(isTheUserAnOwner);
            } catch (error) {
                setIsOwner(false);
            }
        }

        checkIsOwner();
    }, [user]);

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
    ]);

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
    
    const cancelCreation = () => {
        setCurrentPostIndex(0);
        setPosts([{postTitle: "", postDescription: "", postType: "text", textContent: "", imageContent: [], pollContent: [], audioContent: null, videoContent: "", linkContent: []}]);
    }

    const createSinglePost = async () => {
        setCreationError("");
        setCreatingPost(true);
        try {
            const postContent = { postType: posts[0].postType, content: "Some value"}
            await createPost(id, posts[0].postTitle, posts[0].postDescription, postContent, false);
        } catch (error)
        {
            setCreationError(error.message);
        } finally {
            setCreatingPost(false);
        }
    }

    return (
        <>
            <Header/>
            <div className="container">
                <main className="main">
                    <div className="sections">
                        <div className="side">
                            <div className="navbar"></div>
                        </div>
                        <div className="posts">
                            <div className="topbar">
                                <div className="project-info">
                                    <img className="project-icon" src={project?.icon}/>
                                    <h1 className="titleFont title-size">{project?.title}</h1>
                                </div>
                                <div className="filters titleFont">
                                    <button className="button-shape selected">All</button>
                                    <button className="button-shape">Recent</button>
                                    <button className="button-shape">Oldest</button>
                                    <button className="button-shape">Top</button>
                                </div>
                                {isOwner && 
                                <div className="project-actions">
                                    <button className="button-shape titleFont create-post" onClick={() => {SetPanelOpen(true)}}>Create Post</button>
                                </div>}
                            </div>
                            <div className="post-container">
                                <div className="post card text">
                                    <div className="post-top">
                                        <img className="icon pfp-shape" alt="post-icon" src={project?.icon}></img>
                                        <div className="info">
                                            <div className="title-info">
                                                <div className="title-desc">
                                                    <div className="title-date">
                                                        <span className="post-title titleFont header-size">Post Title</span>
                                                        <span className="post-date label-color bodyFont">2 days ago</span>
                                                    </div>
                                                    <span className="post-title bodyFont body-size label-color reset">Post Desc</span>
                                                </div>
                                            </div>
                                            <span className="date-created"></span>
                                        </div>
                                    </div>
                                    <span className="label-color caption-size bodyFont">1 of 1</span>
                                    <div className="post-content">
                                        <div className="content">
                                            <p className="text-post bodyFont body-size">This is a text post</p>
                                            <img className="" alt="image post"></img>
                                            <audio controls className=""></audio>
                                            <video controls className=""></video>
                                            <ul className="poll">
                                                <li>
                                                    <div className="poll-option">
                                                        <div className="color">
                                                            <span className="bodyFont">Poll Option 1</span>
                                                        </div>
                                                        <div className="percent label-color bodyFont caption-size">
                                                            <span className="hide">0%</span>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="poll-option">
                                                        <div className="color">
                                                            <span className="bodyFont">Poll Option 2</span>
                                                        </div>
                                                        <div className="percent label-color bodyFont caption-size">
                                                            <span className="hide">0%</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                            <ul className="links bodyFont">
                                                <li>
                                                    <a target="_blank"><FontAwesomeIcon icon={faLink}/> This is a link</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="actions hide caption-size">
                                            <button className="button-shape bodyFont">Back</button>
                                            <button className="button-shape bodyFont">Next</button>
                                        </div>
                                    </div>
                                    <div className="post-bottom bodyFont">
                                        <div className="rating">
                                            <FontAwesomeIcon className="vote" icon={faArrowUp}/>
                                            <span className="bold bad">0</span>
                                            <FontAwesomeIcon className="vote" icon={faArrowDown}/>
                                        </div>
                                        <div className="comments">
                                            <FontAwesomeIcon icon={faComment}/>
                                            <span className="bold">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="side-section">
                            <div className="card red bodyFont">
                                <h2>Sumting goes here (I think)</h2>
                            </div>
                            <div className="card bodyFont">
                                <span>{project?.description}</span>
                            </div>
                            <div className="card bodyFont">
                                <span className="titleFont">Other Projects</span>
                                <div className="project-span no-select-pointer">
                                    <img className="pfp-shape" alt="project icon"></img>
                                    <span>Project Name</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {panelOpen &&
                <div className="create-panel">
                    <div className="backdrop"></div>
                    <div className="panel-content">
                        <FontAwesomeIcon icon={faCircleXmark} className="close-button bodyFont no-select-pointer" onClick={() => SetPanelOpen(false)}/>
                        <div className="top-section">
                            <h2 className="bodyFont reset">Create Post</h2>
                            <div className="post-options">
                                <span className={`bodyFont label-color no-select-pointer ${creationSelectionIndex == 0 ? "selected" : ""}`} onClick={() => {setCreationSelectionIndex(0); setCurrentPostIndex(0);}}>Post</span>
                                <span className={`bodyFont label-color no-select-pointer ${creationSelectionIndex == 1 ? "selected" : ""}`} onClick={() => setCreationSelectionIndex(1)}>Multipost</span>
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
                                    <span className="label-color no-select-pointer bold mt">Add New</span>
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
                                        <h2 className="titleFont reset">{postTypes[postMainTypeIndex].name} Post</h2>
                                        <CappedInput label="Post Title (Optional)" maxLength={100} value={posts[currentPostIndex].postTitle} onChange={(e) => setPostTitle(e.target.value)} id="post-name"/>
                                        <CappedInput label="Post Description (Optional)" maxLength={200} value={posts[currentPostIndex].postDescription} onChange={(e) => setPostDescription(e.target.value)} id="post-description"/>

                                        <CappedInput className={`${posts[currentPostIndex].postType == "text" ? "" : "hide"}`} label="Post Content" maxLength={1500} value={posts[currentPostIndex].textContent} 
                                        onChange={(e) => {
                                        const updatedPosts = [...posts];
                                        updatedPosts[currentPostIndex] = {
                                            ...updatedPosts[currentPostIndex],
                                            textContent: e.target.value,
                                        };
                                        setPosts(updatedPosts);
                                        }} id="post-content-text" isTextArea={true}/>

                                        {creationError && <p className="error-message bodyFont">{creationError}</p>}
                                    </div>
                                    <div className="actions bodyFont">
                                        <button className="button-shape" onClick={() => { cancelCreation(); SetPanelOpen(false) }}>Cancel</button>
                                        <div className="right">
                                            {creationSelectionIndex == 1 && <button className="button-shape remove">Remove Post Part</button>}
                                            <button className="button-shape create" onClick={() => {createSinglePost()}} disabled={creatingPost}>{creatingPost ? "Creating..." : "Create Post"}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
            </div>
        </>
    )
}