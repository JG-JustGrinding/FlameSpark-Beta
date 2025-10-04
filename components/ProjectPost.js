'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import '@/lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faBars, faEllipsisVertical, faEllipsisH, faThumbTack, faPenToSquare, faEraser, faT, faLayerGroup, faImage, faPoll, faVolumeLow, faVideo, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { extractYouTubeId, timeAgo } from '@/lib/projectFunctions';
import Carousel from './Carousel';
import PanelOverlay from './PanelOverlay';

const ProjectPost = ({icon, postTitle = "", postDescription = "", postContent = null, dateCreated, isOwner = false, isPinned = false, setPinnedFunction = null, updatePostsFunction = null}) => {
    const [currentPostPartIndex, setCurrentPostPartIndex] = useState(0);
    const [currentPostContent, setCurrentPostContent] = useState(null);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [deletePanelOpen, setDeletePanelOpen] = useState(false);
    const [deleteChecked, setDeleteChecked] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(false);
    const dateDifference = timeAgo(dateCreated);

    useEffect(() => {
        if (postContent?.length > 0) {
            setCurrentPostContent(postContent[currentPostPartIndex % postContent.length]);
        }
    }, [currentPostPartIndex, postContent]);

    const nextPostPart = () => {
        if (postContent?.length > 1) {
            setCurrentPostPartIndex((prev) => (prev + 1) % postContent.length);
        }
    };

    const previousPostPart = () => {
        if (postContent?.length > 1) {
            setCurrentPostPartIndex((prev) => (prev - 1 + postContent.length) % postContent.length);
        }
    };

    function GetIconFromPostType() {
        if (postContent?.length > 1)
        {
            return faLayerGroup;
        }

        switch (postContent[0]?.contentType) {
            case "text":
                return faT;
            case "image":
                return faImage;
            case "poll":
                return faPoll;
            case "audio":
                return faVolumeLow;
            case "video":
                return faVideo;
            case "link":
                return faLink;
            default:
                return faT;
        }
    }

    function DeletePost(postId) {
        // delete content (if applicable)


        // delete post from table
        // reload page
    }
    
    return (
    <>
    <div className="post card text">
        <div className={`post-top ${(!postTitle && !postDescription) ? "align-center" : ""}`}>
            <img className="icon pfp-shape" alt="post-icon" src={icon}></img>
            <div className="info">
                <div className="title-info">
                    <div className="title-desc">
                        <div className="title-date">
                            {postTitle && <span className="post-title titleFont header-size">{postTitle}</span>}
                            <span className="post-date label-color bodyFont">{dateDifference}</span>
                        </div>
                        <span className="post-title bodyFont body-size label-color reset">{postDescription}</span>
                    </div>
                </div>
                <span className="date-created"></span>
            </div>
            <div className={`project-top-actions`}>
                <div className='admin'>
                    <FontAwesomeIcon icon={faEllipsisH} className={`no-select-pointer icon${adminPanelOpen ? " open" : ""}`} onClick={() => setAdminPanelOpen(value => !value)}/>
                    {adminPanelOpen &&
                    <div className="post-admin-panel bodyFont">
                        <ul>
                            <li className="no-select-pointer" onClick={() => {setPinnedFunction(); setAdminPanelOpen(false)}}>
                                <FontAwesomeIcon icon={faThumbTack} />
                                <span>{isPinned ? "Unp" : "P"}in Post</span>
                            </li>
                            <li className="no-select-pointer" onClick={() => setAdminPanelOpen(false)}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <span>Edit Post</span>
                            </li>
                            <li className="no-select-pointer" onClick={() => {setDeletePanelOpen(true); setAdminPanelOpen(false)}}>
                                <FontAwesomeIcon icon={faEraser} />
                                <span>Delete Post</span>
                            </li>
                        </ul>
                    </div>
                    }
                </div>
                {isPinned && <FontAwesomeIcon icon={faThumbTack} />}
            </div>
        </div>
        {postContent?.length > 1 && <span className="label-color caption-size bodyFont">{currentPostPartIndex + 1} of {postContent?.length}</span>}
        <div className="post-content">
            <div className="content">
                {currentPostContent?.contentType == "text" && <p className="text-post bodyFont body-size">{currentPostContent?.content}</p>}
                {currentPostContent?.contentType === "image" && (
                <>
                    {currentPostContent?.content?.length <= 1 ? (
                        <img
                            src={currentPostContent?.content?.[0]} 
                            alt="image post"
                        />
                    ) : (
                        <Carousel images={currentPostContent?.content}/>
                    )}
                </>
                )}
                {currentPostContent?.contentType == "audio" && <audio controls className="" src={currentPostContent?.content}></audio>}
                {currentPostContent?.contentType == "video" && 
                    <iframe
                    className="video"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(
                    currentPostContent?.content
                    )}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    />
                }
                {currentPostContent?.contentType == "poll" && <ul className="poll">
                    {currentPostContent?.content.map((pollOption, i) => (
                    <li key={i}>
                        <div className="poll-option no-select-pointer">
                            <div className="color">
                                <span className="bodyFont">{pollOption}</span>
                            </div>
                            <div className="percent label-color bodyFont caption-size">
                                <span className="hide">0%</span>
                            </div>
                        </div>
                    </li>         
                    ))}
                </ul>}
                {currentPostContent?.contentType == "link" && <ul className="links bodyFont">
                    {currentPostContent?.content.map((link, i) => (
                    <li key={i}>
                        <a target="_blank" rel='noopener noreferrer' href={link.url}><FontAwesomeIcon icon={faLink}/>{link.name}</a>
                    </li>         
                    ))}
                </ul>}
            </div>
            <div className={`actions ${postContent?.length <= 1 ? "hide" : ""} caption-size`}>
                <button className="button-shape bodyFont" onClick={() => previousPostPart()}>Back</button>
                <button className="button-shape bodyFont" onClick={() => nextPostPart()}>Next</button>
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
    <PanelOverlay isOpen={deletePanelOpen} onClose={() => setDeletePanelOpen(false)}>
        <h3 className='reset'>Delete Post</h3>
        <span>Are you sure you want to delete this post? This cannot be undone!</span>
        <div className='post-display'>
            <FontAwesomeIcon className="icon" icon={GetIconFromPostType()}/>
            <div className='post-info'>
                <span className='titleFont bold'>{postTitle}</span>
                <span className='bodyFont label-color'>{postDescription}</span>
            </div>
        </div>
        <div className='confirm-checkbox bodyFont'>
            <div className={`checkbox no-select-pointer${deleteChecked ? " checked" : ""}`} onClick={() => setDeleteChecked(!deleteChecked)}>
                <div className="box">
                    <FontAwesomeIcon className="icon" icon={faCheck} />
                </div>
                <span>Yes, I want to delete the selected post</span>
            </div>
        </div>
        <div className='error-container'>
            <span className='bodyFont error-message'>{deleteErrorMessage}</span>
        </div>
        <div className='options'>
            <button className='button-shape' onClick={() => setDeletePanelOpen(false)}>Cancel</button>
            <button className='button-shape delete-button' disabled={!deleteChecked}>Delete</button>
        </div>
    </PanelOverlay>
    </>
    )
}

export default ProjectPost;