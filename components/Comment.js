import React, { use } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize"
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./Comment.css"
import { timeAgo } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPenToSquare, faEraser, faFlag, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { shortenNumber } from "@/lib/projectFunctions";
import PanelOverlay from "./PanelOverlay";

const schema = {
  tagNames: ["b", "i", "em", "strong", "u", "a", "code", "pre", "ul", "ol", "li", "p", "blockquote", "del", "br"],
  attributes: {
    a: ["href", "title", "target"],
  },
};

export default function Comment({
	username = "Username",
	avatar = "",
	date = "X days ago",
	body = "This is a comment.",
    id = "",
    className = "",
    loading = false,
    isOwner = false,
    dontUseTimeAgo = false,
}) {
    const processedBody = body.replace(/__(.*?)__/g, "<u>$1</u>");
    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [editPanelOpen, setEditPanelOpen] = useState(false);

	return (
		<div className={`comment` + (loading ? ` skeleton` : "") + (className ? ` ${className}` : "")}>
			<a href={`/user/${id}`} className="link commenter-pfp pfp-shape">
				<img className={`pfp-shape` + (loading ? " hide" : "")} src={avatar} alt="User Profile Picture" />
			</a>
			<div className={`comment-main bodyFont` + (loading ? " hide" : "")}>
                <div className="comment-header">
                    <div className="comment-user-date">
                        <a href={`/user/${id}`} className="link">
                            <span className="bold username">{username}</span>
                        </a>
                        {date && <span className="label-color caption-size reset">{dontUseTimeAgo ? date : timeAgo(date)}</span>}
                    </div>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
                components={{
                    p: ({ node, ...props }) => <p className="bodyFont comment-body reset" {...props} />,
                }}>{processedBody}</ReactMarkdown>
                <div className="bottom-options label-color">
                    <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                        <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                        <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                        <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
                    </div>

                    {isOwner &&
                    <>
                        <FontAwesomeIcon className="no-select-pointer" icon={faPenToSquare} onClick={() => setEditPanelOpen(true)} />
                        <FontAwesomeIcon className="no-select-pointer" icon={faEraser}/>
                    </>
                    }
                    {!isOwner && <FontAwesomeIcon className="no-select-pointer" icon={faFlag} />}
                </div>
			</div>
            <PanelOverlay isOpen={editPanelOpen} onClose={() => setEditPanelOpen(false)} panelClass='edit'>
                <h3 className='reset'>Edit Post</h3>
            </PanelOverlay>
		</div>
	);
}
