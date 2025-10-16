"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/useUser";
import { faShare, faArrowUp, faArrowDown, faEllipsisH, faTrash, faPaperPlane, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { createComment, shortenNumber } from "@/lib/projectFunctions";
import Header from "@/components/Header";
import "@/styles/PostPage.css";
import "@/styles/ProjectPost.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import MarkdownTextArea from "@/components/MarkdownTextArea";
import Comment from "@/components/Comment";
import { useParams } from "next/navigation";
import { getProject, getPost, fetchComments } from "@/lib/projectFunctions";
import ErrorComponent from "@/components/ErrorComponent";
import { supabase } from "@/lib/supabaseClient";
import { Paginator } from "@/lib/infinitePostFeed";

export default function PostPage() {
    const { id, postId } = useParams();
    const { user, userSet, avatar, username } = useUser();

    const [post, setPost] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [refetchFilter, setRefetchFilter] = useState(""); // this is for refetching comments when the user submits a comment
    const [fetchError, setFetchError] = useState(false);

    const [postRating, setPostRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [commentInputDisabled, setCommentInputDisabled] = useState(false);
    const [commentInputLoading, setCommentInputLoading] = useState(false);
    const [commentUpdateItem, setCommentUpdateItem] = useState(null);

    useEffect(() => {
        async function run(){
            if (!id || !postId)
            {
                return;
            }

            if (post)
            {
                return;
            }

            try {
                const projectFetch = await getProject(id);
                setProject(projectFetch);

                const postFetch = await getPost(postId);
                setPost(postFetch);

                if (postFetch.project_id !== projectFetch.id)
                {
                    throw new Error("Post does not belong to project");
                }

                const commentsFetch = await fetchComments(postId, 0, 10, "");
                setComments(commentsFetch);
            } catch (error) {
                setFetchError(true);
            }
        }

        run();
    }, [postId]);

    useEffect(() => {
        if (!userSet)
        {
            return;
        }

        if (!user)
        {
            setCommentInputDisabled(true);
        }

    }, [userSet]);

    if (fetchError) {
        return <ErrorComponent />
    }

    async function submitComment() {
        if (commentInput.trim() === "") {
            return;
        }

        try {
            await createComment(postId, user?.id, commentInput, null);

            setCommentInput("");

            setRefetchFilter(Date.now().toString()); // trigger refetch of comments
        } catch {

        } finally {
            setCommentInputLoading(false);
        }
    }

    async function reportComment(comment, reason, details) {
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

        setCommentUpdateItem({ ...comment, removeReportButton: true });
    }

    async function editComment(comment, newText)
    {
        const { error } = await supabase.rpc("edit_comment", { p_comment_id: comment.id, p_new_content: newText});

        if (error) throw error;

        setCommentUpdateItem({ ...comment, content: newText, was_edited: true });
    }

    async function deleteComment(comment) {
        try {
            const updating = { ...comment, deleting: true };
            setCommentUpdateItem(updating);

            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", comment.id);

            if (error) throw error;

            const removed = { ...comment, remove_item: true };
            setCommentUpdateItem(removed);
        } catch (error) {
            const removed = { ...comment, remove_item: false };
            setCommentUpdateItem(removed);
        }
    }

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
                            {post?.title && <h1 className="titleFont reset">{post?.title}</h1>}
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
                        <MarkdownTextArea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder={commentInputDisabled ? "Log in to comment" : "Add a comment..."} disabled={commentInputDisabled || commentInputLoading} maxLength={1000} className="comment-input" id="comment-input" noMinHeight={true} submitButton={true} submitFunction={() => {submitComment()}} />
                        {((user || !userSet) && commentInput) && 
                        <>
                            <Comment avatar={avatar || "/profile_icon_colored.svg"} loading={!userSet || (user != null && !avatar)} username={username} body={commentInput} date="comment preview" dontUseTimeAgo={true}/>
                            <span className="break"/>
                        </>
                        }

                        <div className="comments-section">
                            <Paginator fetchFunction={fetchComments} projectId={postId}
                            renderItem={(comment, idx) => (
                                <Comment key={idx} id={comment.id} postId={postId} isOwner={user?.id === comment.user_id} posterId={comment.user_id} username={comment.username} avatar={comment.avatar_url || "/profile_icon_colored.svg"} date={comment.created_at} body={comment.content} replyCount={comment.reply_count} user={user} currentUsername={username} currentAvatar={avatar} editCommentFunction={editComment.bind(null, comment)} edited={comment.was_edited} deleteCommentFunction={() => deleteComment(comment)} deleting={comment.deleting} reportCommentFunction={reportComment.bind(null, comment)} removeReportButton={comment.removeReportButton || !user} canReply={user}/>
                            )}
                            updateItem={commentUpdateItem}
                            limit={10}
                            filter={refetchFilter}
                            noneFoundMessage=""
                            />
                        </div>
                    </div>
                </div>
                <div className="side-section">
                    <div className={`project-info card`}>
                        <div className="project">
                            <img className="project-icon pfp-shape" src="/default_project_icon.png" alt="Project Icon"></img>
                            <h3 className={`titleFont full-width reset${project ? "" : " skeleton"}`}>{project?.title || "No Title"}</h3>
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
