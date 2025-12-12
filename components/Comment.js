import React, { use, useEffect, useRef } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize"
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./Comment.css"
import { fetchReplyCount, fetchReplies, createComment, timeAgo } from "@/lib/projectFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPenToSquare, faEraser, faFlag, faArrowUp, faArrowDown, faReply, faArrowAltCircleUp, faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { shortenNumber } from "@/lib/projectFunctions";
import PanelOverlay from "./PanelOverlay";
import MarkdownTextArea from "./MarkdownTextArea";
import CappedInput from "./CappedInput";
import { supabase } from "@/lib/supabaseClient";

const schema = {
  tagNames: ["b", "i", "em", "strong", "u", "a", "code", "pre", "ul", "ol", "li", "p", "blockquote", "del", "br"],
  attributes: {
    a: ["href", "title", "target"],
  },
};

export default function Comment({
    id = null,
    postId = null,
	username = "Username",
	avatar = "",
	date = "X days ago",
	body = "This is a comment.",
    canReply = true,
    replyCount = 0,
    posterId = "", // user id
    user = null, // current user (used for the reply system)
    currentUsername = "",
    currentAvatar = "",
    loading = false,
    isOwner = false,
    dontUseTimeAgo = false,
    edited = false,
    editCommentFunction = null,
    deleteCommentFunction = null,
    deleting = false,
    reportCommentFunction = null,
    removeReportButton = false,
}) {
    const processedBody = body.replace(/__(.*?)__/g, "<u>$1</u>");
    const [replying, setReplying] = useState(false);
    const [replyInput, setReplyInput] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [repliesOpen, setRepliesOpen] = useState(false);
    const [replies, setReplies] = useState([]);
    const [hasMoreReplies, setHasMoreReplies] = useState(false);
    const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const replyPage = useRef(0);
    const replyPageCount = 10;
    const [replyCountOverride, setReplyCountOverride] = useState(null);
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [editPanelTextValue, setEditPanelTextValue] = useState(body);
    const [editPanelLoading, setEditPanelLoading] = useState(false);
    const [editPanelError, setEditPanelError] = useState("");
    const processedEditPanelText = editPanelTextValue.replace(/__(.*?)__/g, "<u>$1</u>");
    const [deletePanelOpen, setDeletePanelOpen] = useState(false);
    const [reportPanelOpen, setReportPanelOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [reportPanelLoading, setReportPanelLoading] = useState(false);
    const [reportPanelError, setReportPanelError] = useState("");
    const [reportPanelDone, setReportPanelDone] = useState(false);
    const reportOptions = [
        { label: "Spam", value: "spam" },
        { label: "Harassment", value: "harassment" },
        { label: "Hate Speech", value: "hate_speech" },
        { label: "Misleading", value: "misleading" },
        { label: "Other", value: "other" }
    ];

    useEffect(() => {
        setEditPanelTextValue(body);
    }, [editPanelOpen]);

    async function replyToComment() {
        setReplyError("");
        setReplyLoading(true);

        try {
            await createComment(postId, user?.id, replyInput, id);

            setReplying(false);
            if (!repliesOpen) {
                setRepliesOpen(true);
            } else {
                FetchReplies();
            }
            setReplyInput("");
        } catch (error) {
            setReplyError(error.message || "An error occured.");
        } finally {
            setReplyLoading(false);
        }
    }

    useEffect(() => {
        if (repliesOpen)
        {
            FetchReplies();
        } else {
            setReplies([]);
        }
    }, [repliesOpen]);

    async function FetchReplies()
    {
        replyPage.current = 0;

        try {
            setRepliesLoading(true);
            const count = await fetchReplyCount(id);

            setReplyCountOverride(count);

            const replies = await fetchReplies(id, replyPage.current, replyPageCount);
            
            setReplies(replies);

            if (replies.length >= count)
            {
                setHasMoreReplies(false);
            } else {
                setHasMoreReplies(true);
            }
        } catch (error) {

        } finally {
            setRepliesLoading(false);
        }
    }

    async function fetchMoreReplies() {
        const currentPage = replyPage.current + 1;

        try {
            setLoadingMoreReplies(true);

            const count = await fetchReplyCount(id);

            setReplyCountOverride(count);

            const newReplies = await fetchReplies(id, currentPage, replyPageCount);
            const newValue = [...replies, ...newReplies];

            setReplies(newValue);

            if (newValue.length >= count)
            {
                setHasMoreReplies(false);
            } else {
                setHasMoreReplies(true);
            }

            replyPage.current = currentPage;
        } catch (error) {

        } finally {
            setLoadingMoreReplies(false);
        }
    }

    function editComment() {
        setEditPanelLoading(true);
        setEditPanelError("");

        editCommentFunction(processedEditPanelText).then(response => {
            setEditPanelOpen(false);
            setEditPanelLoading(false);
        }).catch(error => {
            setEditPanelError(error.message || "An error occurred.");
            setEditPanelLoading(false);
        });
    }

    function reportComment() {
        setReportPanelLoading(true);
        setReportPanelError("");

        reportCommentFunction(reportReason, reportDetails).then(response => {
            setReportPanelDone(true);
            setReportPanelLoading(false);
        }).catch(error => {
            setReportPanelLoading(false);
            setReportPanelError(error.message || "An error occurred.")
        })
    }

    async function reportReply(comment, reason, details) {
        if ((!reason || !reason.trim()) && (!details || !details.trim())) {
            throw new Error("Please provide a reason or details for your report.");
        }

        const { error } = await supabase
            .from("reports")
            .insert({
            reporter_id: user?.id,
            target_table: "comments",
            target_id: comment.id,
            reason,
            details,
        });

        if (error)
        {
            throw error;
        }

        setReplies(prevReplies =>
            prevReplies.map(reply =>
            reply.id === comment.id
                ? { ...reply, removeReportButton: true }
                : reply
            )
        );
    }

    async function editReply(comment, newText)
    {
        const { error } = await supabase.rpc("edit_comment", { p_comment_id: comment.id, p_new_content: newText});

        if (error) throw error;

        setReplies(prevReplies =>
            prevReplies.map(reply =>
            reply.id === comment.id
                ? { ...reply, content: newText, was_edited: true }
                : reply
            )
        );
    }

    async function deleteReply(comment) {
        try {
            setReplies(prevReplies =>
                prevReplies.map(reply =>
                reply.id === comment.id
                    ? { ...reply, deleting: true  }
                    : reply
                )
            );

            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", comment.id);

            if (error) throw error;
            
            setReplies(prevReplies =>
                prevReplies.filter(reply => reply.id !== comment.id)
            );

            setReplyCountOverride(value => value - 1);
        } catch (error) {
            setReplies(prevReplies =>
                prevReplies.map(reply =>
                reply.id === comment.id
                    ? { ...reply, deleting: false  }
                    : reply
                )
            );
        }
    }

	return (
		<div className={`comment` + (loading ? ` skeleton` : "")}>
			<a href={posterId ? `/user/${posterId}` : null} className={`link commenter-pfp pfp-shape` + (deleting ? " deleting" : "")}>
				<img className={`pfp-shape` + (loading ? " hide" : "")} src={avatar} alt="User Profile Picture" />
			</a>
			<div className={`comment-main bodyFont` + (loading ? " hide" : "") + (deleting ? " deleting" : "")}>
                <div className="comment-header">
                    <div className="comment-user-date">
                        <a href={posterId ? `/user/${posterId}` : null} className="link">
                            <span className="bold username">{username}</span>
                        </a>
                        {date && <span className="label-color caption-size reset">{`${dontUseTimeAgo ? date : timeAgo(date)}${edited ? " (edited)" : ""}`}</span>}
                    </div>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
                components={{
                    p: ({ node, ...props }) => <p className="bodyFont comment-body reset" {...props} />,
                    a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target={props.target || "_blank"}
                          rel={(props.rel ? props.rel + " " : "") + "noopener noreferrer"}
                        />
                    ),
                }}>{processedBody}</ReactMarkdown>
                {id && <div className="bottom-options label-color">
                    {((replyCountOverride || replyCount) > 0 && replyCountOverride != 0) && <div className="bodyFont body-size replies-count bold no-select-pointer" onClick={() => {setRepliesOpen(value => !value)}} style={{display: "flex", gap: "3px", alignItems: "center"}}>
                        <FontAwesomeIcon icon={repliesOpen ? faArrowAltCircleDown : faArrowAltCircleUp}/>
                        <span>{shortenNumber(replyCountOverride || replyCount)} {(replyCountOverride || replyCount) != 1 ? "Replies" : "Reply"}</span>
                    </div>}
                    {false && <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                        <FontAwesomeIcon className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateFunction(1); UpdateRating(1)}}/>
                        <span className="bold bad">{shortenNumber(commentRating + (userRating || 0))}</span>
                        <FontAwesomeIcon className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateFunction(-1); UpdateRating(-1)}}/>
                    </div>}
                    {isOwner &&
                    <>
                        <FontAwesomeIcon className="no-select-pointer" icon={faPenToSquare} onClick={() => setEditPanelOpen(true)} />
                        <FontAwesomeIcon className="no-select-pointer dark" icon={faEraser} onClick={() => setDeletePanelOpen(true)} />
                    </>
                    }
                    {canReply && <FontAwesomeIcon className={`icon no-select-pointer` + (replying ? " selected" : "")} icon={faReply} onClick={() => setReplying(value => !value)}/>}
                    {(!isOwner && !removeReportButton) && <FontAwesomeIcon className="no-select-pointer dark" icon={faFlag} onClick={() => setReportPanelOpen(true)} />}
                </div> }
                {replying && <div className="reply-field">
                    <MarkdownTextArea value={replyInput} onChange={(e) => setReplyInput(e.target.value)} placeholder="Enter reply here..." maxLength={1000} className="reply-comment-input" submitButton={true} disabled={replyLoading} submitFunction={() => {replyToComment()}} noMinHeight={true}/>
                    {replyError && <span className="bodyFont error-message" style={{marginBottom: "10px"}}>{replyError}</span>}
                    {(replyInput && user) && 
                    <>
                        <Comment avatar={currentAvatar || "/profile_icon_colored.svg"} username={currentUsername} body={replyInput} date="comment preview" dontUseTimeAgo={true}/>
                        <span className="break"/>
                    </>
                    }
                </div> }
                {repliesOpen && (
                    <div style={{marginTop: replying ? '5px' : '18px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        {repliesLoading && <div className="replies-loading-bar" />}

                        {repliesLoading && replies.length === 0 ? (
                            <div className="replies-spinner" />
                        ) : (
                            <div className="replies-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                {replies.map((comment, idx) => (
                                    <Comment key={comment.id || idx} id={comment.id} isOwner={user?.id === comment.user_id} posterId={comment.user_id} username={comment.username} avatar={comment.avatar_url || "/profile_icon_colored.svg"} date={comment.created_at} body={comment.content} replyCount={comment.reply_count} user={user} currentUsername={username} currentAvatar={avatar} editCommentFunction={editReply.bind(null, comment)} edited={comment.was_edited} deleteCommentFunction={() => deleteReply(comment)} deleting={comment.deleting} reportCommentFunction={reportReply.bind(null, comment)} removeReportButton={comment.removeReportButton || !user} canReply={false}/>
                                ))}
                                {hasMoreReplies && <span className="bodyFont replies-more bold no-select-pointer caption-size" onClick={() => fetchMoreReplies()}>{loadingMoreReplies ? "Loading..." : "Load More"}</span>}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <PanelOverlay isOpen={editPanelOpen} onClose={() => setEditPanelOpen(false)} panelClass='edit'>
                <h3 className='reset'>Edit Comment</h3>
                <MarkdownTextArea value={editPanelTextValue} onChange={(e) => setEditPanelTextValue(e.target.value)} placeholder="Enter text here..." maxLength={1000} className="edit-comment-input" id="edit-comment-input" submitButton={true} disabled={editPanelLoading} submitFunction={() => {editComment();}} noMinHeight={true}/>
                
                <span className="bodyFont label-color caption-size">Comment Preview</span>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
                components={{
                    p: ({ node, ...props }) => <p className="bodyFont comment-body reset" {...props} />,
                    a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target={props.target || "_blank"}
                          rel={(props.rel ? props.rel + " " : "") + "noopener noreferrer"}
                        />
                    ),
                }}>{processedEditPanelText}</ReactMarkdown>
                {editPanelError && <span className="error-message bodyFont">{editPanelError}</span>}
            </PanelOverlay>
            <PanelOverlay isOpen={deletePanelOpen} onClose={() => setDeletePanelOpen(false)} panelClass='delete'>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', padding:'18px 0'}}>
                    <FontAwesomeIcon icon={faEraser} style={{fontSize:'2.5rem', color:'var(--flamespark-red-accented)'}} />
                    <h3 className='titleFont' style={{margin:0}}>Delete Comment?</h3>
                    <span className='bodyFont label-color hide' style={{fontSize:'1.05rem', textAlign:'center', maxWidth:'340px'}}>This action is <span style={{color:'var(--flamespark-red-accented)'}}>permanent</span> and cannot be undone. Are you sure you want to delete this comment?</span>
                    <div style={{display:'flex', gap:'12px', marginTop:'10px'}}>
                        <button className='button-shape bodyFont' onClick={() => setDeletePanelOpen(false)}>Cancel</button>
                        <button className='button-shape bodyFont red-color-accented' onClick={() => {setDeletePanelOpen(false); deleteCommentFunction();}}>Delete</button>
                    </div>
                </div>
            </PanelOverlay>
            <PanelOverlay isOpen={reportPanelOpen} onClose={() => {if (!reportDetails) {setReportReason("");} setReportPanelOpen(false)}}>
                {!reportPanelDone && <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', padding:'18px 0'}}>
                    <FontAwesomeIcon icon={faFlag} style={{fontSize:'2.5rem', color:'var(--flamespark-red-accented)'}} />
                    <h3 className='titleFont' style={{margin:0}}>Report Comment</h3>
                    <span className='bodyFont label-color' style={{fontSize:'1.05rem', textAlign:'center', maxWidth:'340px'}}>Select a reason for reporting this comment</span>
                    <div style={{display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', margin:'8px 0'}}>
                        {reportOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`button-shape bodyFont${reportReason === opt.value ? ' red-color-accented' : ''}`}
                                style={{padding:'8px 18px', border: reportReason === opt.value ? '2px solid var(--flamespark-red-accented)' : '1px solid #ccc', background: reportReason === opt.value ? 'var(--flamespark-red-accented)' : '#fff', color: reportReason === opt.value ? '#fff' : 'var(--flamespark-red-accented)', fontWeight: reportReason === opt.value ? 'bold' : 'normal'}}
                                onClick={() => setReportReason(opt.value)}
                            >{opt.label}</button>
                        ))}
                    </div>
                    <CappedInput className="full-width" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Add details (optional)..." maxLength={500} isTextArea={true}/>
                    <div style={{display:'flex', gap:'12px', marginTop:'10px'}}>
                        <button className='button-shape bodyFont' disabled={reportPanelLoading} onClick={() => {setReportReason(""); setReportDetails(""); setReportPanelOpen(false)}}>Cancel</button>
                        <button className='report-button button-shape bodyFont red-color-accented' disabled={(!reportReason && !reportDetails) || reportPanelLoading} onClick={() => reportComment()}>{reportPanelLoading ? "Submitting..." : "Submit Report"}</button>
                    </div>
                    {reportPanelError && <span className="error-message bodyFont">{reportPanelError}</span>}
                </div>}
                {reportPanelDone &&
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', padding:'18px 0', minHeight:'180px'}}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{fontSize:'2.5rem', color:'var(--flamespark-green)'}} />
                        <h3 className='titleFont' style={{margin:0}}>Report Submitted</h3>
                        <span className='bodyFont label-color' style={{fontSize:'1.05rem', textAlign:'center', maxWidth:'340px'}}>Thank you for helping keep FlameSpark safe!</span>
                    </div>
                }
            </PanelOverlay>
		</div>
	);
}
