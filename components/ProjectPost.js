'use client';

import React, { useState, useEffect } from 'react';
import '@/lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faLink } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'

const ProjectPost = ({icon, postTitle = "", postDescription = "", postType = "text"}) => {
    return (
    <div className="post card text">
        <div className="post-top">
            <img className="icon pfp-shape" alt="post-icon" src={icon}></img>
            <div className="info">
                <div className="title-info">
                    <div className="title-desc">
                        <div className="title-date">
                            <span className="post-title titleFont header-size">{postTitle}</span>
                            <span className="post-date label-color bodyFont">2 days ago</span>
                        </div>
                        <span className="post-title bodyFont body-size label-color reset">{postDescription}</span>
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
    )
}

export default ProjectPost;