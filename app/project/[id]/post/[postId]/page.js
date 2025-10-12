"use client";
import { useState } from "react";
import { faShare, faArrowUp, faArrowDown, faEllipsisH, faTrash, faPaperPlane, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { shortenNumber } from "@/lib/projectFunctions";
import Header from "@/components/Header";
import "@/styles/PostPage.css";
import "@/styles/ProjectPost.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import CappedInput from "@/components/CappedInput";

export default function PostPage() {
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [commentInput, setCommentInput] = useState("");

	return (
		<>
        <div className="body-container">
			<Header />
            <main className="main">
                <div className="back">
                    <FontAwesomeIcon className="back-button" icon={faArrowLeft}/>
                </div>
                <div className="content card">
                        <div className="title-date">
                            <h1 className="titleFont reset">Post Title</h1>
                            <p className="post-date label-color bodyFont reset">{`X Days ago`}</p>
                        </div>
                        <h2 className="bodyFont reset normal-weight label-color">Post Description</h2>
                    <div className="post-body">

                    </div>
                    <div className="post-bottom bodyFont">
                        <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                            <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                            <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                            <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
                        </div>
                        <div className="share option">
                            <FontAwesomeIcon icon={faShare}/>
                        </div>
                    </div>
                    <div className="comments-container">
                        <h3 className="titleFont reset">Comments</h3>
                        <CappedInput value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add a comment..." maxLength={1000} isTextArea={true} className="comment-input" id="comment-input" noMinHeight={true}>
                            <div className="input-options">
                                <div className="rich-text">
                                    <button className="rich-text-button bodyFont" title="Bold"><b>B</b></button>
                                    <button className="rich-text-button bodyFont" title="Italic"><i>I</i></button>
                                    <button className="rich-text-button bodyFont" title="Underline"><u>U</u></button>
                                    <button className="rich-text-button bodyFont" title="Strikethrough"><s>S</s></button>
                                    <button className="rich-text-button bodyFont" title="Code"><code>{"</>"}</code></button>
                                    <button className="rich-text-button bodyFont" title="Link">🔗</button>
                                    <button className="rich-text-button bodyFont" title="Bullet List">• List</button>
                                    <button className="rich-text-button bodyFont" title="Numbered List">1. List</button>
                                    <button className="rich-text-button bodyFont" title="Quote">"</button>
                                </div>
                                <div className="submit-section">
                                    <FontAwesomeIcon icon={faArrowRight} className="no-select-pointer"/>
                                </div>
                            </div>
                        </CappedInput>
                        <div className="comments-section">
                            <div className="comment">
                                <a href="/user"><img className="commenter-pfp pfp-shape" src="/default_user_icon.png" alt="User Profile Picture"/></a>
                                <div>
                                    <div className="comment-header">
                                        <a href="/user"><span className="bodyFont bold username">Username</span></a>
                                        <span className="bodyFont label-color">X days ago</span>
                                    </div>
                                    <p className="bodyFont comment-body reset">This is a comment.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="side-section">
                    <div className="project-info card">
                        <div className="project">
                            <img className="project-icon pfp-shape" src="/default_project_icon.png" alt="Project Icon"></img>
                            <h3 className="titleFont reset">Project Title</h3>
                        </div>
                        <p className="bodyFont">Project description</p>
                        <p className="bodyFont reset normal-weight label-color">Tag 1, tag 2</p>

                        <button className="bodyFont button-shape project-action red-color">Join Project</button>
                    </div>
                    <div className="other-posts card">
                        <a href="#" className="other-post">
                            <div className="project-information">
                                <img className="project-icon-other pfp-shape" src="/default_project_icon.png" alt="Project Icon"/>
                                <span className="bodyFont">Other Post Title</span>
                            </div>
                            <div className="o-content">
                                <div className="text">
                                    <h4 className="titleFont reset">Post Title</h4>
                                    <p className="bodyFont reset">Post description</p>
                                </div>
                                <div className="other-post-content-display">
                                    <img className="other-post-image" src="https://tse2.mm.bing.net/th/id/OIP.Z73ULgQ422BKGyeUB6GDhAHaEK?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Post Image"/>
                                </div>
                            </div>
                        </a>
                        <span className="break"/>
                    </div>
                </div>
            </main>

        </div>
		</>
	);
}
