"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/lib/useUser';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faL, faLink, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { timeAgo } from "@/lib/projectFunctions";
import { extractYouTubeId, getPostRating, getUserRating, shortenNumber, getPostCommentCount } from '@/lib/projectFunctions';
import Carousel from './Carousel';
import PostContentView from './PostContentView';
import ShareButton from './ShareButton';

const HomePagePost = ({postId, title = "", description = "", dateCreated, postContent, projectName = "", projectIcon = "", projectId, className="", rateFunction = null, goToPreview = false, disableContent = false, is_project_completed = false, currentPostIndex = 0, postIndex = 0, previousIndex}) => {
    const dateDifference = timeAgo(dateCreated);
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [commentCount, setCommentCount] = useState(0);
    const { user } = useUser();
    
    const audioRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        if ((currentPostIndex != postIndex) && (previousIndex == postIndex)) {
            resetMedia();
        }
    }, [previousIndex]);

    const resetMedia = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.load();
        }

        // Reset iframe (force reload by changing src)
        if (iframeRef.current) {
            const src = iframeRef.current.src;
            iframeRef.current.src = src;
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

    return (
        <article className={`post` + (className ? ` ${className}` : "")}>
            <header className="post-header">
                <div className="post-text">
                    <h3 className="post-title titleFont reset bold">{title}</h3>
                    {description && <p className="post-description bodyFont reset label-color">{description}</p>}
                </div>
                <time className="post-description bodyFont label-color" aria-label={`Posted ${dateDifference}`}>{dateDifference}</time>
            </header>
            <PostContentView postContent={postContent} audioRef={audioRef} iframeRef={iframeRef}/>
            <div className="post-footer">
                <a className="post-project" href={`project/${projectId}` + (goToPreview ? "/preview" : "")} aria-label={`View ${projectName}`}>
                    <img className="post-project-icon pfp-shape" src={projectIcon} alt={`${projectName} icon`} />
                    <span className="post-project-name bodyFont bold">{projectName}</span>
                    {is_project_completed && <FontAwesomeIcon className="completed-label" icon={faCircleCheck}/>}
                </a>
                <div className="post-stats bodyFont">
                    <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                        <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                        <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                        <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
                    </div>
                    <a className={`comments${commentCount != null ? "" : " skeleton"}`} href={`/project/${projectId}/post/${postId}`} style={{display: "flex"}} aria-label={`${shortenNumber(commentCount) || 0} comments`}>
                        <FontAwesomeIcon className="comment-icon" icon={faComment} />
                        <span className="bold">{shortenNumber(commentCount) || 0}</span>
                    </a>
                    <ShareButton postId={postId} projectId={projectId} forceLeft={true}/>
                </div>
            </div>
        </article>
    )
}

export default HomePagePost;