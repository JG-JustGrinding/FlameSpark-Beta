'use client';

import React, { useState, useEffect } from 'react';
import '@/lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'
import { extractYouTubeId, timeAgo } from '@/lib/projectFunctions';
import Carousel from './Carousel';

const ProjectPost = ({icon, postTitle = "", postDescription = "", postContent = null, dateCreated}) => {
    const [currentPostPartIndex, setCurrentPostPartIndex] = useState(0);
    const [currentPostContent, setCurrentPostContent] = useState(null);
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
    
    return (
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
    )
}

export default ProjectPost;