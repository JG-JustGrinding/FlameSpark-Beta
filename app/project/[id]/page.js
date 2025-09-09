"use client"
import Header from "@/components/Header";
import ErrorComponent from "@/components/ErrorComponent"
import { useState, useEffect } from "react";
import { getProject } from "@/lib/projectFunctions";
import { useParams } from "next/navigation";
import '@/lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { isUserOwner, createPost, getProjectPosts, extractYouTubeId } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faCircleXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faT, faImage, faVideo, faVolumeLow, faPoll, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import "@/styles/project.css"
import "@/styles/projectCreatePanel.css"
import ProjectPost from "@/components/ProjectPost";
import Carousel from "@/components/Carousel";
import CappedInput from "@/components/CappedInput";

export default function ProjectPage(){
    const [project, setProject] = useState(null);
    const [projectPosts, setProjectPosts] = useState([]);
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
        async function run(){
            try {
                const value = await getProjectPosts(id);
                setProjectPosts(value);
            } catch (error) {

            }
        }

        run();
    }, [id])

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
        // imageContent = [ { image (url), imageUpload (file) } ] 
        // audioContent = { audio (url), audioUpload (file) }
    ]);
    const [currentPollText, setCurrentPollText] = useState("");

    const MAX_POST_IMAGES = 3;
    const MAX_POLL_OPTIONS = 4;
    const MAX_LINKS = 5;

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
            linkContent: [...targetPost.linkContent, {name: "New Link", url: ""}],
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
        try {
            const post = posts[0];

            const content = await handlePost(post);

            const postContent = { postType: post.postType, content }
            //await createPost(id, post.postTitle, post.postDescription, postContent, false);
        } catch (error)
        {
            setCreationError(error.message);
        } finally {
            setCreatingPost(false);
        }
    }

    const handlePost = async (post) => {
        let content = [];

        if (post.postType == "text")
        {

        } else if (post.postType == "image") {

        } else if (post.postType == "poll") {
            
        } else if (post.postType == "audio") {
            
        } else if (post.postType == "video") {
            
        } else if (post.postType == "link") {
            
        }

        return content;
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
                                    <button className="button-shape selected">Recent</button>
                                    <button className="button-shape">Oldest</button>
                                    <button className="button-shape">Top</button>
                                </div>
                                {isOwner && 
                                <div className="project-actions">
                                    <button className="button-shape titleFont create-post" onClick={() => {SetPanelOpen(true)}}>Create Post</button>
                                </div>}
                            </div>
                            <div className="posts-container">
                                <ProjectPost icon={project?.icon} postTitle="Post Title" postDescription="Post Description"></ProjectPost>                
                                {projectPosts.map((post, i) => (
                                    <ProjectPost key={i} icon={project?.icon} postTitle={post.title} postDescription={post.description}></ProjectPost>                
                                ))}
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
                                    { posts.length < 3 && <span className="label-color no-select-pointer bold mt">Add New</span> }
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
                                            <input type="file" accept="image/*" className="bodyFont input-field" multiple onChange={(e) => {handlePostImageChange(e, currentPostIndex)}} />
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
                                            <CappedInput className="poll-creator-input" label="Poll Options" hideCounter={true} maxLength={50} value={currentPollText} onChange={(e) => setCurrentPollText(e.target.value)} id="post-poll-text">
                                                {posts[currentPostIndex].pollContent.length < MAX_POLL_OPTIONS && <button className="add-button no-select-pointer" onClick={() => {addNewPollOption(currentPollText)}}><FontAwesomeIcon icon={faPlus}/></button> }
                                            </CappedInput>
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