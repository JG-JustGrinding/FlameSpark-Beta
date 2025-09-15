"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { timeAgo } from "@/lib/projectFunctions";
import { extractYouTubeId } from '@/lib/projectFunctions';
import Carousel from './Carousel';

const HomePagePost = ({title = "", description = "", dateCreated, postContent, projectName = "", projectIcon = "", projectId, votes = 0, comments = 0, className=""}) => {
    const dateDifference = timeAgo(dateCreated);
    const [currentPostPartIndex, setCurrentPostPartIndex] = useState(0);
    const [currentPostContent, setCurrentPostContent] = useState(null);
    
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
            <div className="post-footer">
                <a className="post-project" href={`project/${projectId}`}>
                    <img className="post-project-icon pfp-shape" src={projectIcon} alt="Project Icon"></img>
                    <span className="post-project-name bodyFont bold">{projectName}</span>
                </a>
                <div className="post-stats">
                    <div className="rating">
                        <FontAwesomeIcon className="vote" icon={faArrowUp}/>
                        <span className="bold bodyFont bad">{votes}</span>
                        <FontAwesomeIcon className="vote" icon={faArrowDown}/>
                    </div>
                    <div className="comments">
                        <FontAwesomeIcon className="comment-icon" icon={faComment}></FontAwesomeIcon>
                        <span className="comment-count bodyFont bold">{comments}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePagePost;