"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faL, faLink } from '@fortawesome/free-solid-svg-icons';
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { timeAgo } from "@/lib/projectFunctions";
import { extractYouTubeId, getPostRating, getUserRating, shortenNumber } from '@/lib/projectFunctions';
import Carousel from './Carousel';

const HomePagePost = ({postId, title = "", description = "", dateCreated, postContent, projectName = "", projectIcon = "", projectId, className="", rateFunction = null, goToPreview = false, disableContent = false, currentPostIndex = 0, postIndex = 0, previousIndex}) => {
    const dateDifference = timeAgo(dateCreated);
    const [currentPostPartIndex, setCurrentPostPartIndex] = useState(0);
    const [currentPostContent, setCurrentPostContent] = useState(null);
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [commentCount, setCommentCount] = useState(0);
    const [commentCountLoading, setCommentCountLoading] = useState(true);
    
    const audioRef = useRef(null);
    const iframeRef = useRef(null);

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
                console.log(error)
            }
        }

        GetRating();
    }, []);

    function UpdateRating(value) {
        if (value == userRating)
        {
            setUserRating(0);
            return;
        }

        setUserRating(value);

    }

    return (
        <div className={`post` + (className ? ` ${className}` : "")}>
            <div className="post-header">
                <div className="post-text">
                    <span className="post-title titleFont bold">{title}</span>
                    <span className="post-description bodyFont label-color">{description}</span>
                </div>
                <span className="post-description bodyFont label-color">{dateDifference}</span>
            </div>
            {postContent?.length > 1 && <span className="label-color caption-size bodyFont">{currentPostPartIndex + 1} of {postContent?.length}</span>}
            <div className="post-content">
                <div className={`content${disableContent ? " hide" : ""}`}>
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
                    {currentPostContent?.contentType == "audio" && <audio controls className="" src={currentPostContent?.content} ref={audioRef}></audio>}
                    {currentPostContent?.contentType == "video" && 
                        <iframe
                        className="video"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(
                        currentPostContent?.content
                        )}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ref={iframeRef}
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
            <div className="post-footer">
                <a className="post-project" href={`project/${projectId}` + (goToPreview ? "/preview" : "")}>
                    <img className="post-project-icon pfp-shape" src={projectIcon} alt="Project Icon"></img>
                    <span className="post-project-name bodyFont bold">{projectName}</span>
                </a>
                <div className="post-stats bodyFont">
                    <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                        <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                        <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                        <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
                    </div>
                    <div className="comments">
                        <FontAwesomeIcon className="comment-icon" icon={faComment}></FontAwesomeIcon>
                        <span className="comment-count bodyFont bold">{shortenNumber(commentCount)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePagePost;