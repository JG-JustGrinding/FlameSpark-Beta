'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import '@/lib/fontawesome'
import { getPostRating, getUserRating } from '@/lib/projectFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faBars, faEllipsisVertical, faEllipsisH, faThumbTack, faPenToSquare, faEraser, faT, faLayerGroup, faImage, faPoll, faVolumeLow, faVideo, faCheck, faShare } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { editPost, extractYouTubeId, timeAgo, shortenNumber, getPostCommentCount } from '@/lib/projectFunctions';
import Carousel from './Carousel';
import PanelOverlay from './PanelOverlay';
import CappedInput from './CappedInput';

const ProjectPost = ({postId, icon, postTitle = "", postDescription = "", postContent = null, dateCreated, isOwner = false, isPinned = false, wasEdited = false, setPinnedFunction = null, rateFunction = null}) => {
    const [currentPostPartIndex, setCurrentPostPartIndex] = useState(0);
    const [currentPostContent, setCurrentPostContent] = useState(null);
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [commentCount, setCommentCount] = useState(null);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [editPostTitle, setEditPostTitle] = useState(postTitle);
    const [editPostDescription, setEditPostDescription] = useState(postDescription);
    const [editing, setEditing] = useState(false); // when the edit button is clicked
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

    useEffect(() => {
        async function GetRating() {
            try {
                let rating = await getPostRating(postId);

                const userRating = await getUserRating(postId);

                if (userRating == -1)
                {
                    rating++;
                }

                if (userRating == 1)
                {
                    rating--;
                }

                setPostRating(rating);

                setUserRating(userRating);

                setRatingLoading(false);
            } catch (error) {
                
            }
        }

        async function GetCommentCount() {
            try {                
                let count = await getPostCommentCount(postId);
                setCommentCount(count || 0);
            } catch (error) {

            }
        }

        GetRating();
        GetCommentCount();
    }, []);

    async function editPostFunction () {
        try {
            setEditing(true);
            await editPost(postId, editPostTitle, editPostDescription);
            window.location.reload();
        } catch {

        }
    }

    function UpdateRating(value) {
        if (value == userRating)
        {
            setUserRating(0);
            return;
        }

        setUserRating(value);

    }

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
                            <span className="post-date label-color bodyFont">{`${dateDifference}${wasEdited ? " (edited)" : ""}`}</span>
                        </div>
                        <span className="post-title bodyFont body-size label-color reset">{postDescription}</span>
                    </div>
                </div>
                <span className="date-created"></span>
            </div>
            <div className={`project-top-actions`}>
                {isPinned && <FontAwesomeIcon icon={faThumbTack} />}
                {isOwner && <div className='admin'>
                    <FontAwesomeIcon icon={faEllipsisH} className={`no-select-pointer icon${adminPanelOpen ? " open" : ""}`} onClick={() => setAdminPanelOpen(value => !value)}/>
                    {adminPanelOpen &&
                    <div className="post-admin-panel bodyFont">
                        <ul>
                            <li className="no-select-pointer" onClick={() => {setPinnedFunction(); setAdminPanelOpen(false)}}>
                                <FontAwesomeIcon icon={faThumbTack} />
                                <span>{isPinned ? "Unp" : "P"}in Post</span>
                            </li>
                            <li className="no-select-pointer" onClick={() => {setEditPanelOpen(true); setAdminPanelOpen(false)}}>
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
                </div> }
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
            <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
            </div>
            <a className={`comments${commentCount != null ? "" : " skeleton"}`} href={`${window.location.pathname}/post/${postId}`}>
                <FontAwesomeIcon className="comment-icon" icon={faComment}/>
                <span className="bold">{shortenNumber(commentCount) || 0}</span>
            </a>
            <div className="share option">
                <FontAwesomeIcon icon={faShare}/>
            </div>
        </div>
    </div>
    <PanelOverlay isOpen={editPanelOpen} onClose={() => setEditPanelOpen(false)} panelClass='edit'>
        <h3 className='reset'>Edit Post</h3>
        <CappedInput label="Post Title" value={editPostTitle} onChange={(e) => setEditPostTitle(e.target.value)} id="edit-post-title" className='edit-post-input extra-margin' maxLength={100} />
        <CappedInput label="Post Description" value={editPostDescription} onChange={(e) => setEditPostDescription(e.target.value)} id="edit-post-description" className='edit-post-input' maxLength={200} />
        <div className='options'>
            <button className={`button-shape${editing ? " invisible" : ""}`} disabled={editing} onClick={() => setEditPanelOpen(false)}>Cancel</button>
            <button className='button-shape edit-button extra-margin' disabled={editing} onClick={() => editPostFunction()}>{editing ? "Saving..." : "Save Changes"}</button>
        </div>
    </PanelOverlay>
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