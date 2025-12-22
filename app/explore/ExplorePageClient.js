"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./page.css";
import Header from "@/components/Header";
import PostContentView from "@/components/PostContentView";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import ShareButton from "@/components/ShareButton";
import { fetchExplorePagePostsNew, getPostCommentCount, getPostRating, getUserRating, ratePost, shortenNumber, timeAgo } from "@/lib/projectFunctions";
import SignupNotice from "@/components/SignupNotice";

// Helpers to control YouTube iframe via Player API
function playYouTube(iframe) {
	try {
		iframe?.contentWindow?.postMessage(
			JSON.stringify({ event: "command", func: "playVideo", args: [] }),
			"*"
		);
	} catch {}
}

function pauseYouTube(iframe) {
	try {
		iframe?.contentWindow?.postMessage(
			JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
			"*"
		);
	} catch {}
}

function Reel({ post, index, userId = null }) {
	const postTitle = post?.post_title ?? "";
	const postDescription = post?.post_description ?? "";
	const projectTitle = post?.project_title ?? "";
	const projectIcon = post?.project_icon ?? "";
	const projectId = post?.project_id ?? "";
	const postId = post?.post_id ?? "";
	const postDate = post?.post_created_at ?? null;
	const [postRating, setPostRating] = useState(0);
	const [userRating, setUserRating] = useState(0);
	const [ratingLoading, setRatingLoading] = useState(true);
	const [commentCount, setCommentCount] = useState(null);
    const [showSignupNotice, setShowSignupNotice] = useState(false);

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
					
				}
			}
	
			async function GetCommentCount() {
				try {                
					let count = await getPostCommentCount(postId);
					setCommentCount(count || 0);
				} catch (error) {
	
				}
			}
	
			GetRating();
			GetCommentCount();
		}, []);

	const rateFunction = async (value) => {
		try {
			await ratePost(postId, userId, value);
		} catch (err) {
			if (err?.notLoggedIn || !userId) {
				setShowSignupNotice(true);
				return;
			}
		}
	}

	function UpdateRating(value) {
		if (!userId)
		{
			return;
		}

		if (value == userRating)
		{
			setUserRating(0);
			return;
		}

		setUserRating(value);
    }

	return (
		<>
		<section className="reel" data-index={index} aria-label={`Post ${index + 1}`}>
			<div className="content-frame" aria-label="Post content">
				<div className="content-frame-inner">
					<PostContentView postContent={post?.post_content ?? null} defaultStyling={true} />
				</div>
			</div>
			<div className="reel-ui">
				<div
					style={{
						position: "absolute",
						left: 16,
						right: 16,
						bottom: 18,
						display: "flex",
						flexDirection: "column",
						gap: 12,
						pointerEvents: "none",
					}}
				>
					{/* Project pill */}
					<Link
						href={projectId ? `/project/${projectId}/preview` : "#"}
						className="project-pill"
						style={{ pointerEvents: "auto" }}
						aria-label={projectTitle ? `Project ${projectTitle}` : "Project info"}
					>
						{projectIcon ? (
							<img
								src={projectIcon}
								alt={projectTitle ? `${projectTitle} icon` : "Project icon"}
								className="pfp-shape project-pill-icon"
							/>
						) : (
							<div className="project-pill-placeholder" aria-hidden="true" />
						)}
						<span className="titleFont project-pill-title">
							{projectTitle || "Untitled Project"}
						</span>
					</Link>
					{/* Post info */}
					<div
						className="reel-options"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 16,
							borderTop: "1px solid #ccc",
							paddingTop: 6,
						}}
					>
						<div className="reel-post-info" style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
							{postTitle && <p className="titleFont" style={{ fontWeight: 'bold', margin: '5px 0px 0px 0px' }}>{postTitle}</p>}
							{postDescription && (
								<span className="caption bodyFont" style={{ fontWeight: 400 }}>{postDescription}</span>
							)}
							{postDate && (
								<span className="bodyFont" style={{ fontSize: '0.8rem', opacity: 0.8 }}>{timeAgo(postDate)}</span>
							)}
						</div>
						{/* Actions row */}
						<div className="reel-actions" style={{ marginTop: 0, flexShrink: 0 }}>
							<div className="rating" style={{ pointerEvents: "auto" }}>
								<button className={`vote up${userRating === 1 ? " selected" : ""}`} aria-label="Upvote" style={{ pointerEvents: "auto" }} onClick={() => {rateFunction(1); UpdateRating(1)}}>▲</button>
								<span className="vote-count bodyFont">{shortenNumber(postRating + (userRating || 0))}</span>
								<button className={`vote down${userRating === -1 ? " selected" : ""}`} aria-label="Downvote" style={{ pointerEvents: "auto" }} onClick={() => {rateFunction(-1); UpdateRating(-1)}}>▼</button>
							</div>
							<Link 
								href={projectId && postId ? `/project/${projectId}/post/${postId}` : "#"}
								className="action-btn bodyFont" 
								style={{ pointerEvents: "auto" }}
								aria-label="Comment"
							>
								<FontAwesomeIcon icon={faComment}/>{typeof commentCount === "number" ? ` ${commentCount}` : ""}
							</Link>
							<ShareButton className="share-action-btn normal" postId={postId} projectId={projectId} />
						</div>
					</div>
				</div>
			</div>
		</section>
		<SignupNotice
			isOpen={showSignupNotice}
			onClose={() => setShowSignupNotice(false)}
			title="Join the FlameSpark-Beta Community"
			messageIndex={1}
		/>
		</>
	);
}

export default function ExplorePageClient({ initialPosts, initialSeed, pageSize = 10, userId = null }) {
	const [posts, setPosts] = useState(Array.isArray(initialPosts) ? initialPosts : []);

	const containerRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [page, setPage] = useState(1); // initialPosts are page 0
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [showSwipePopup, setShowSwipePopup] = useState(false);
	const swipePopupTimeout = useRef(null);
	// Show popup if user swipes up on first post (mobile UX)
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		let touchStartY = null;
		let touchStartX = null;
		let touchMoved = false;

		function onTouchStart(e) {
			if (currentIndex !== 0) return;
			if (e.touches && e.touches.length === 1) {
				touchStartY = e.touches[0].clientY;
				touchStartX = e.touches[0].clientX;
				touchMoved = false;
			}
		}

		function onTouchMove(e) {
			if (currentIndex !== 0) return;
			if (touchStartY === null || touchStartX === null) return;
			if (e.touches && e.touches.length === 1) {
				const deltaY = e.touches[0].clientY - touchStartY;
				const deltaX = e.touches[0].clientX - touchStartX;
				if (!touchMoved && Math.abs(deltaY) > 32 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaY < 0) {
					setShowSwipePopup(true);
					if (swipePopupTimeout.current) clearTimeout(swipePopupTimeout.current);
					swipePopupTimeout.current = setTimeout(() => setShowSwipePopup(false), 1800);
					touchMoved = true;
				}
			}
		}

		function onTouchEnd() {
			touchStartY = null;
			touchStartX = null;
			touchMoved = false;
		}

		// Only hide popup on horizontal scroll (not vertical)
		let lastScrollLeft = container.scrollLeft;
		function onScroll() {
			const deltaX = Math.abs(container.scrollLeft - lastScrollLeft);
			lastScrollLeft = container.scrollLeft;
			if (showSwipePopup && deltaX > 2) {
				setShowSwipePopup(false);
				if (swipePopupTimeout.current) clearTimeout(swipePopupTimeout.current);
			}
		}

		container.addEventListener("touchstart", onTouchStart, { passive: true });
		container.addEventListener("touchmove", onTouchMove, { passive: true });
		container.addEventListener("touchend", onTouchEnd, { passive: true });
		container.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			container.removeEventListener("touchstart", onTouchStart);
			container.removeEventListener("touchmove", onTouchMove);
			container.removeEventListener("touchend", onTouchEnd);
			container.removeEventListener("scroll", onScroll);
			if (swipePopupTimeout.current) clearTimeout(swipePopupTimeout.current);
		};
	}, [currentIndex, showSwipePopup]);

	useEffect(() => {
		return;
		const current = posts[currentIndex];
		const baseTitle = "Explore - FlameSpark";
		const title = current?.post_title && String(current.post_title).trim().length
			? `${current.post_title} - FlameSpark`
			: baseTitle;
		document.title = title;
	}, [currentIndex, posts]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		// Observe reels instead of only videos so images also update index/title
		const reels = Array.from(container.querySelectorAll(".reel"));
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const reel = entry.target;
					const indexStr = reel?.getAttribute("data-index");
					const idx = indexStr ? parseInt(indexStr, 10) : 0;
					const iframeEl = reel.querySelector("iframe.video");
					const audioEls = Array.from(reel.querySelectorAll("audio"));
					if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
						setCurrentIndex(idx);
						if (iframeEl) playYouTube(iframeEl);
						audioEls.forEach((a) => {
							try {
								a.play().catch(() => {});
							} catch {}
						});
					} else {
						if (iframeEl) pauseYouTube(iframeEl);
						audioEls.forEach((a) => {
							try {
								a.pause();
							} catch {}
						});
					}
				});
			},
			{
				root: container,
				threshold: [0.4, 0.6, 0.85],
			}
		);

		reels.forEach((r) => observer.observe(r));
		return () => observer.disconnect();
	}, [posts.length]);

	// Load more when user approaches the end
	useEffect(() => {
		const nearEnd = currentIndex >= posts.length - 3; // preload before last two
		if (!nearEnd || loading || !hasMore) return;
		const load = async () => {
			try {
				setLoading(true);
				const newPosts = await fetchExplorePagePostsNew(userId, page, pageSize, initialSeed);
				if (Array.isArray(newPosts) && newPosts.length > 0) {
					setPosts((prev) => [...prev, ...newPosts]);
					setPage((p) => p + 1);
					if (newPosts.length < pageSize) setHasMore(false);
				} else {
					setHasMore(false);
				}
			} catch (e) {
				// keep hasMore true to retry later unless explicit failure
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [currentIndex, posts.length, loading, hasMore, page, pageSize, userId, initialSeed]);

	const scrollToIndex = (i) => {
		const container = containerRef.current;
		if (!container) return;
		const maxIndex = hasMore ? posts.length - 1 : posts.length;
		const clamped = Math.max(0, Math.min(maxIndex, i));
		const target = container.querySelector(`.reel[data-index="${clamped}"]`);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", inline: "start" });
		}
	};

	const goPrev = () => {
		scrollToIndex(currentIndex - 1);
	};
	const goNext = () => scrollToIndex(currentIndex + 1);

	// Keyboard navigation (Left/Right)
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const onKey = (e) => {
			if (["ArrowRight", "PageDown"].includes(e.key)) {
				e.preventDefault();
				goNext();
			} else if (["ArrowLeft", "PageUp"].includes(e.key)) {
				e.preventDefault();
				goPrev();
			}
		};
		container.addEventListener("keydown", onKey);
		container.setAttribute("tabindex", "0");
		return () => container.removeEventListener("keydown", onKey);
	}, [currentIndex]);

	// Re-center current reel on window resize/zoom
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		
		let resizeTimeout;
		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				const target = container.querySelector(`.reel[data-index="${currentIndex}"]`);
				if (target) {
					target.scrollIntoView({ behavior: "auto", inline: "start" });
				}
			}, 150);
		};
		
		window.addEventListener("resize", handleResize);
		return () => {
			clearTimeout(resizeTimeout);
			window.removeEventListener("resize", handleResize);
		};
	}, [currentIndex]);

	useEffect(() => {
		const setVH = () => {
			document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
		};
		setVH();
		window.addEventListener("resize", setVH);
		return () => window.removeEventListener("resize", setVH);
	}, []);

	const maxIndex = hasMore ? posts.length - 1 : posts.length;
	const showLeftArrow = currentIndex > 0;
	const showRightArrow = currentIndex < maxIndex;

	return (
		<>
			<div className="tt-hor-header">
				<Header />
			</div>
			<main className="tt-hor-container" ref={containerRef} role="feed" aria-live="polite">
				<button 
					className="arrow-btn left" 
					aria-label="Previous" 
					onClick={goPrev}
					style={{ 
						opacity: showLeftArrow ? 1 : 0,
						pointerEvents: showLeftArrow ? 'auto' : 'none'
					}}
				>
					&#10094;
				</button>
				<button 
					className="arrow-btn right" 
					aria-label="Next" 
					onClick={goNext}
					style={{ 
						opacity: showRightArrow ? 1 : 0,
						pointerEvents: showRightArrow ? 'auto' : 'none'
					}}
				>
					&#10095;
				</button>
				{posts.map((post, i) => (
					<Reel key={post.id ?? i} post={post} index={i} userId={userId} />
				))}
				{!hasMore && (
					<section
						className="reel"
						data-index={posts.length}
						aria-label="End of feed"
					>
						<div className="content-frame" aria-label="No more posts">
							<div className="content-frame-inner">
								<div className="post-content-view">
									<div className="content" style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center'}}>
										<h2 className="titleFont reset text-post" style={{ fontSize: "1.25rem", fontWeight: 700, width: "100%" }}>
											You’ve reached the end of the Explore page!
										</h2>
										<p className="text-post bodyFont" style={{ textAlign: 'center' }}>
											As more projects and posts are created on FlameSpark, they'll show up here. In the meantime, why not discover some new projects or start your own?
										</p>
										<div style={{display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap'}}>
											<a href="/" className="button-shape bodyFont blue-color">
												Discover Projects
											</a>
											<a href="/create" className="button-shape bodyFont red-color">
												Create a Project
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				)}
				{/* Swipe horizontally popup with animation */}
				<div
					className={`bodyFont swipe-popup${showSwipePopup ? ' show' : ''}`}
					aria-live="polite"
					aria-atomic="true"
				>
					Swipe horizontally to explore more posts
				</div>
			</main>
		</>
	);
}

