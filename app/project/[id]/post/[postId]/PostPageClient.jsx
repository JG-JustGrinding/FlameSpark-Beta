"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";
import { faShare, faArrowUp, faArrowDown, faEllipsisH, faTrash, faPaperPlane, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { createComment, shortenNumber, getProject, getPost, fetchComments, timeAgo, isUserJoinedOrOwner, getPostRating, getUserRating, ratePost, fetchProjectPageOtherPosts, fetchReplyCount } from "@/lib/projectFunctions";
import Header from "@/components/Header";
import styles from "@/styles/PostPage.module.css";
import "@/styles/ProjectPost.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import MarkdownTextArea from "@/components/MarkdownTextArea";
import Comment from "@/components/Comment";
import { useParams } from "next/navigation";
import ErrorComponent from "@/components/ErrorComponent";
import { supabase } from "@/lib/supabaseClient";
import { Paginator } from "@/lib/infinitePostFeed";
import PostContentView from "@/components/PostContentView";
import OtherPost from "@/components/OtherPost";
import ShareButton from "@/components/ShareButton";
import SignupNotice from "@/components/SignupNotice";

export default function PostPage({id, postId, post, project, seed, otherPostsState }) {
    const { user, userSet, avatar, username } = useUser();
    const router = useRouter();

    const contentRef = useRef(null);
    const sideRef = useRef(null);

    const [refetchFilter, setRefetchFilter] = useState(""); // this is for refetching comments when the user submits a comment
    const [otherPosts, setOtherPosts] = useState(otherPostsState || []);
    const [otherPostsPage, setOtherPostsPage] = useState(otherPostsState?.length > 0 ? 1 : 0);

    const [isJoinedSet, setIsJoinedSet] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const [userRating, setUserRating] = useState(0);
    const [postRating, setPostRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const [commentInputDisabled, setCommentInputDisabled] = useState(false);
    const [commentInputLoading, setCommentInputLoading] = useState(false);
    const [commentUpdateItem, setCommentUpdateItem] = useState(null);
    const [showSignupNotice, setShowSignupNotice] = useState(false);

    useEffect(() => {
        if (!userSet)
        {
            return;
        }

        if (!user)
        {
            setIsJoinedSet(true);
            setIsJoined(true);
            setCommentInputDisabled(true);
        }

        const check = async () => {
            if (user != null && id != null && postId != null)
            {
                const result = await isUserJoinedOrOwner(user.id, id);
                setIsJoined(result);
                setIsJoinedSet(true);
            } else {
                setIsJoinedSet(true);
                setIsJoined(false);
            }
        };

      check();
    }, [userSet]);

    useEffect(()=> {
        if (!otherPostsState || otherPostsState.length === 0) {
            const setOtherPagePosts = async () => {
                try {
                    const posts = await fetchProjectPageOtherPosts(postId, id, 0, 5, seed);
                    setOtherPosts(posts);
                } catch (error) {
                } finally {
                }
            };
            setOtherPagePosts();
        }
    }, []);

    useEffect(() => {
        const checkHeights = () => {
            if (contentRef.current && sideRef.current) {
                const contentHeight = contentRef.current.offsetHeight;
                const sideHeight = sideRef.current.offsetHeight;
                
                //console.log(`Content height: ${contentHeight}px, Side section height: ${sideHeight}px`);

                if (sideHeight < contentHeight) {
                    //console.log(`Side section height (${sideHeight}px) is less than content height (${contentHeight}px)`);
                }
            }
        };

        // Check after a short delay to ensure DOM has fully rendered
        const timer = setTimeout(checkHeights, 100);
        
        return () => clearTimeout(timer);
    }, [otherPosts, post, project]);

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

                setUserRating(userRating);
                setPostRating(rating);

                setRatingLoading(false);
            } catch (error) {
                
            }
        }

        GetRating();
    }, []);

    function UpdateRating(value) {
        if (!user) {
            setShowSignupNotice(true);
            return;
        }

        if (value == userRating)
        {
            setUserRating(0);
            return;
        }

        setUserRating(value);
    }

    async function rateProjectPost(value)
    {
        try {
            await ratePost(postId, user?.id, value);
        } catch (err) {
            if (err?.notLoggedIn || !user) {
                setShowSignupNotice(true);
                return;
            }
        }
    }

    const viewOrJoinProject = async () => {
        if (user == null){
            setShowSignupNotice(true);
            return;
        }
        
        if (!isJoined)
        {
            try {
                await joinProject(user.id, id);
            } catch (error) {

            }
        }

        router.push(`/project/${id}`);
    }

    async function FetchCommentsFunction(postId, page, pageSize, filter = "") {
        return await fetchComments(postId, page, pageSize, filter);
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
        <div className={styles.bodyContainer}>
			<Header />
            <main className={styles.main}>
                <div className={styles.back}>
                    <a href={`/project/${id}`} className="reset">
                        <FontAwesomeIcon className={`${styles.backButton} reset`} icon={faArrowLeft}/>
                    </a>
                </div>
                <div className={`${styles.content} ${styles.card}`} ref={contentRef}>
                    <div className={styles.postHeader}>
                        <div className={styles.titleDate}>
                            {post?.title && <h1 className="titleFont reset">{post?.title}</h1>}
                            {post?.created_at &&  <p className={`${styles.postDate} label-color bodyFont reset`}>{timeAgo(post?.created_at)}</p>}
                        </div>
                        {post?.description && <h2 className="bodyFont reset normal-weight label-color">{post?.description}</h2>}
                    </div>
                    <PostContentView postContent={post?.content} defaultStyling={true}/>
                    <div className={`${styles.postBottom} post-bottom bodyFont`}>
                        <div className={`rating${ratingLoading ? " skeleton" : ""}`}>
                            <button className={`vote up${userRating == 1 ? " selected" : ""}`} icon={faArrowUp} onClick={() => {rateProjectPost(1); UpdateRating(1)}}>▲</button>
                            <span className="bold bad">{shortenNumber(postRating + (userRating || 0))}</span>
                            <button className={`vote down${userRating == -1 ? " selected" : ""}`} icon={faArrowDown} onClick={() => {rateProjectPost(-1); UpdateRating(-1)}}>▼</button>
                        </div>
                        <ShareButton postId={postId} projectId={id}/>
                    </div>
                    <div className={`${styles.commentsContainer}`}>
                        <h3 className="titleFont reset">Comments</h3>
                        <MarkdownTextArea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder={commentInputDisabled ? "Log in to comment" : "Add a comment..."} disabled={commentInputDisabled || commentInputLoading} maxLength={1000} className="comment-input" id="comment-input" noMinHeight={true} submitButton={true} submitFunction={() => {submitComment()}} />
                        {((user || !userSet) && commentInput) && 
                        <>
                            <Comment avatar={avatar || "/profile_icon_colored.svg"} loading={!userSet || (user != null && !avatar)} username={username} body={commentInput} date="comment preview" dontUseTimeAgo={true}/>
                            <span className="break"/>
                        </>
                        }

                        <div className={`${styles.commentsSection}`}>
                            <Paginator fetchFunction={FetchCommentsFunction} projectId={postId}
                            renderItem={(comment, idx) => (
                                <Comment key={idx} id={comment.id} postId={postId} isOwner={user?.id === comment.user_id} posterId={comment.user_id} username={comment.username} avatar={comment.avatar_url || "/profile_icon_colored.svg"} date={comment.created_at} body={comment.content} replyCount={comment.reply_count} user={user} currentUsername={username} currentAvatar={avatar} editCommentFunction={editComment.bind(null, comment)} edited={comment.was_edited} deleteCommentFunction={() => deleteComment(comment)} deleting={comment.deleting} reportCommentFunction={reportComment.bind(null, comment)} removeReportButton={comment.removeReportButton || !user} canReply={user}/>
                            )}
                            updateItem={commentUpdateItem}
                            limit={20}
                            filter={refetchFilter}
                            noneFoundMessage=""
                            askLoadMore={true}
                            askLoadMoreAfter={30}
                            />
                        </div>
                    </div>
                </div>
                <div className={`${styles.sideSection}`} ref={sideRef}>
                    <div className={`${styles.projectInfo} ${styles.card}`}>
                        <a href={`/project/${project?.id}`} className={`${styles.project} styled-link`}>
                            <img className={`${styles.projectIcon} pfp-shape`} src={project?.icon} alt="Project Icon"></img>
                            <h3 className={`titleFont full-width reset${project ? "" : " skeleton"}`}>{project?.title || "No Title"}</h3>
                        </a>
                        {project?.description && <p className="bodyFont">{project?.description}</p>}
                        {project?.tags && <p className="bodyFont reset normal-weight label-color">{project?.tags.join(', ')}</p>}

                        {!isJoinedSet && <button className={`button-shape bodyFont skeleton ${styles.projectAction} body-size cursor-default`} disabled>View Project</button>}
                        {isJoinedSet && <button className={`button-shape bodyFont ${styles.projectAction} ${isJoined ? "blue-color" : "red-color"} body-size`} onClick={viewOrJoinProject}>{isJoined ? "View Project" : "Join Project"}</button>}
                    </div>
                    {otherPosts?.length > 0 && <div className={`${styles.otherPosts} ${styles.card}`}>
                        {otherPosts.map((post, i) => (
                            <div className={`${styles.otherPostContainer}`} key={i}>
                                <OtherPost postContent={post.post_content} postId={post.post_id} postTitle={post.post_title} postDescription={post.post_description} projectId={post.project_id} projectTitle={post.project_title} projectIcon={post.project_icon} postDate={post.post_created_at} styles={styles} />
                                {i <= otherPosts.length - 2 && <span className={`${styles.break}`}/>}
                            </div>
                        ))}
                    </div>}
                </div>
            </main>
            <SignupNotice
                isOpen={showSignupNotice}
                onClose={() => setShowSignupNotice(false)}
                title="Join the FlameSpark-Beta Community"
                messageIndex={1}
                loginText="View Project as Guest"
                loginHref={`/project/${id}`}
                signupText="Login"
                signupHref={`/login?redirectUrl=/project/${id}/post/${postId}`}
            />
        </div>
		</>
	);
}
