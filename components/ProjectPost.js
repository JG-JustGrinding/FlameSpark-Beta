'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from "@/lib/useUser";
import '@/lib/fontawesome'
import { deletePost, getPostRating, getUserRating } from '@/lib/projectFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink, faBars, faEllipsisVertical, faEllipsisH, faThumbTack, faPenToSquare, faEraser, faT, faLayerGroup, faImage, faPoll, faVolumeLow, faVideo, faCheck, faShare, faFireFlameCurved } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { editPost, extractYouTubeId, timeAgo, shortenNumber, getPostCommentCount } from '@/lib/projectFunctions';
import Carousel from './Carousel';
import PanelOverlay from './PanelOverlay';
import CappedInput from './CappedInput';
import PostContentView from './PostContentView';
import ShareButton from './ShareButton';

const ProjectPost = ({postId, icon, postTitle = "", postDescription = "", postContent = null, dateCreated, isOwner = false, isPinned = false, wasEdited = false, setPinnedFunction = null, rateFunction = null, projectId = null}) => {
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [commentCount, setCommentCount] = useState(null);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const adminRef = useRef(null);
    const [editPostTitle, setEditPostTitle] = useState(postTitle);
    const [editPostDescription, setEditPostDescription] = useState(postDescription);
    const [editing, setEditing] = useState(false); // when the edit button is clicked
    const [deletePanelOpen, setDeletePanelOpen] = useState(false);
    const [deleteChecked, setDeleteChecked] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(false);
    const dateDifference = timeAgo(dateCreated);
    const { user } = useUser();

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
        if (!user)
        {
            return;
        }

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
                return faLayerGroup;
        }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (adminRef.current && !adminRef.current.contains(event.target)) {
                setAdminPanelOpen(false);
            }
        }

        if (adminPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [adminPanelOpen]);

    async function DeletePost() {
        try {
            setDeleteLoading(true);
            await deletePost({id: postId, content: postContent });
            window.location.reload();
        } catch (error) {
            setDeleteErrorMessage(error.message || "An error occured.");
            setDeleteLoading(false);
        }
    }
    
    return (
    <>
    <article className="post card no-overflow text">
        <div className={`post-top ${(!postTitle && !postDescription) ? "align-center" : ""}`}>
            <img className="icon pfp-shape" alt={`${postTitle || 'Project'} post icon`} src={icon} />
            <div className="info">
                <div className="title-info">
                    <div className="title-desc">
                        <div className="title-date">
                            {postTitle && <h3 className="post-title titleFont header-size reset normal-weight">{postTitle}</h3>}
                            <time className="post-date label-color bodyFont" aria-label={`Posted ${dateDifference}`}>{`${dateDifference}${wasEdited ? "" : ""}`}</time>
                        </div>
                        {postDescription && <p className="post-title bodyFont body-size label-color reset">{postDescription}</p>}
                    </div>
                </div>
            </div>
            <div className={`project-top-actions`}>
                {isPinned && <FontAwesomeIcon icon={faThumbTack} />}
                {isOwner && <div className='admin'>
                    <FontAwesomeIcon icon={faEllipsisH} className={`no-select-pointer icon${adminPanelOpen ? " open" : ""}`} onClick={() => setAdminPanelOpen(value => !value)}/>
                    {adminPanelOpen &&
                    <div ref={adminRef} className="post-admin-panel bodyFont">
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
        <PostContentView postContent={postContent} />
        <div className="post-bottom bodyFont">
            <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
            </div>
            <a className={`comments${commentCount != null ? "" : " skeleton"}`} href={`/project/${projectId}/post/${postId}`}>
                <FontAwesomeIcon className="comment-icon" icon={faComment}/>
                <span className="bold">{shortenNumber(commentCount) || 0}</span>
            </a>
            <ShareButton postId={postId} projectId={projectId}/>
        </div>
    </article>
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
            <button className='button-shape delete-button' disabled={!deleteChecked || deleteLoading} onClick={() => DeletePost()}>{deleteLoading ? "Deleting..." : "Delete"}</button>
        </div>
    </PanelOverlay>
    </>
    )
}

export default ProjectPost;