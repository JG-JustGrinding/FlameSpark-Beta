'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { extractYouTubeId } from '@/lib/projectFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons';
import './PostContentView.css';
import Carousel from './Carousel';
import Poll from './Poll';


export default function PostContentView({ postContent = null, className = '', defaultStyling = false, audioRef = null, iframeRef = null }) {
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
    <>
    {postContent?.length > 1 && <span className="label-color caption-size bodyFont">{currentPostPartIndex + 1} of {postContent?.length}</span>}
    <div className={`post-content` + (defaultStyling ? " post-content-view" : "") + (postContent ? "" : " skeleton") + (className ? " " + className : "")}>
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
                <Poll pollId={currentPostContent?.content}/>
            </ul>}
            {currentPostContent?.contentType == "link" && <ul className="links bodyFont">
                {currentPostContent?.content.map((link, i) => (
                <li key={i}>
                    <a target="_blank" rel='noopener noreferrer' href={link.url}><FontAwesomeIcon icon={faLink}/>{link.name}</a>
                </li>         
                ))}
            </ul>}
        </div>
        {(postContent?.length && postContent?.length > 1) && <div className={`actions caption-size`}>
            <button className="button-shape bodyFont blue-color" onClick={() => previousPostPart()}>Back</button>
            <button className="button-shape bodyFont blue-color" onClick={() => nextPostPart()}>Next</button>
        </div>}
    </div>
    </>
    );
}
