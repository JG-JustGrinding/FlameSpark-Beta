"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./page.css";
import Header from "@/components/Header";
import PostContentView from "@/components/PostContentView";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import ShareButton from "@/components/ShareButton";

function Reel({ post, index }) {
	const postTitle = post?.post_title ?? "";
	const postDescription = post?.post_description ?? "";
	const projectTitle = post?.project_title ?? "";
	const projectIcon = post?.project_icon ?? "";
	const projectId = post?.project_id ?? "";
	const postId = post?.id ?? post?.post_id ?? "";
	const upCount = 0;
	const downCount = 0;
	const commentCount = 0;

	return (
		<section className="reel" data-index={index} aria-label={`Post ${index + 1}`}>
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
						pointerEvents: "auto",
					}}
				>
					{/* Project pill */}
					<Link
						href={projectId ? `/project/${projectId}/preview` : "#"}
						className="project-pill"
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
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 16,
							color: "#fff",
							textShadow: "0 1px 2px rgba(0,0,0,0.36)",
							borderTop: "1px solid #ccc",
							paddingTop: 6,
						}}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
							{postTitle && <p className="caption bodyFont" style={{ fontWeight: 600, margin: '5px 0px 0px 0px' }}>{postTitle}</p>}
							{postDescription && (
								<span className="creator titleFont" style={{ fontWeight: 400 }}>{postDescription}</span>
							)}
						</div>
						{/* Actions row */}
						<div className="reel-actions no-select-pointer" style={{ marginTop: 0, flexShrink: 0 }}>
							<div className="rating">
								<button className="vote up" aria-label="Upvote">▲</button>
								<span className="vote-count bodyFont">{typeof upCount === "number" && typeof downCount === "number" ? upCount - downCount : 0}</span>
								<button className="vote down" aria-label="Downvote">▼</button>
							</div>
							<Link 
								href={projectId && postId ? `/project/${projectId}/post/${postId}` : "#"}
								className="action-btn bodyFont" 
								aria-label="Comment"
							>
								<FontAwesomeIcon icon={faComment}/>{typeof commentCount === "number" ? ` ${commentCount}` : ""}
							</Link>
							<ShareButton className="action-btn normal" postId={postId} projectId={projectId} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function ExplorePageClient({ initialPosts, initialSeed }) {
	const posts = useMemo(() => Array.isArray(initialPosts) ? initialPosts : [], [initialPosts]);

	const containerRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);

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
					const videoEl = reel.querySelector("video");
					if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
						setCurrentIndex(idx);
						if (videoEl) {
							try {
								videoEl.play().catch(() => {});
							} catch {}
						}
					} else {
						if (videoEl) {
							videoEl.pause();
						}
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
	}, []);

	const scrollToIndex = (i) => {
		const container = containerRef.current;
		if (!container) return;
		const clamped = Math.max(0, Math.min(posts.length - 1, i));
		const target = container.querySelector(`.reel[data-index="${clamped}"]`);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", inline: "start" });
			setCurrentIndex(clamped);
		}
	};

	const goPrev = () => scrollToIndex(currentIndex - 1);
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

	return (
		<>
			<div className="tt-hor-header">
				<Header />
			</div>
			<main className="tt-hor-container" ref={containerRef} role="feed" aria-live="polite">
				<button className="arrow-btn left" aria-label="Previous" onClick={goPrev}>
					&#10094;
				</button>
				<button className="arrow-btn right" aria-label="Next" onClick={goNext}>
					&#10095;
				</button>
				{posts.map((post, i) => (
					<Reel key={post.id ?? i} post={post} index={i} />
				))}
			</main>
		</>
	);
}

