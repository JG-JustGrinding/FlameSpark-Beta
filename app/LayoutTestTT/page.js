"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./page.css";
import Header from "@/components/Header";

function Reel({ post, index }) {
	const isVideo = post.type === "video";
	return (
		<section className="reel" data-index={index} aria-label={`Post ${index + 1}`}>
			{isVideo ? (
				<video
					className="reel-media"
					src={post.src}
					poster={post.poster}
					playsInline
					muted
					loop
					preload="metadata"
				/>
			) : (
				<img className="reel-media" src={post.src} alt={post.caption || `Image ${index + 1}`} loading="lazy" />
			)}

			<div className="reel-ui">
				<div className="ui-right">
					<button className="ui-btn" aria-label="Like">❤</button>
					<button className="ui-btn" aria-label="Comment">💬</button>
					<button className="ui-btn" aria-label="Share">↗</button>
				</div>
				<div className="ui-bottom">
					{post.caption && <p className="caption bodyFont">{post.caption}</p>}
					{post.creator && <span className="creator titleFont">@{post.creator}</span>}
				</div>
			</div>
		</section>
	);
}

export default function LayoutTestTTPage() {
	// Replace with real data source. Using demo posts for now.
	const demoPosts = useMemo(
		() => [
			{
				id: 1,
				type: "image",
				src: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
				poster: "https://images.pexels.com/photos/1526909/pexels-photo-1526909.jpeg",
				caption: "A calm river scene",
				creator: "naturecam",
			},
			{
				id: 2,
				type: "image",
				src: "https://tse4.mm.bing.net/th/id/OIP.N8zkcqQYaX4OwSWwu4Q1YwHaE7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
				caption: "Prototype mock up",
				creator: "flamespark",
			},
			{
				id: 3,
				type: "image",
				src: "https://tse2.mm.bing.net/th/id/OIP.PXngdfaShwiU_EHWME608gHaEK?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
				poster: "https://tse4.mm.bing.net/th/id/OIP.anKWGqae6nu6SNOPyFuVxwHaE8?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
				caption: "Abstract lights",
				creator: "studiofx",
			},
			{
				id: 4,
				type: "image",
				src: "https://images.pexels.com/photos/381228/pexels-photo-381228.jpeg?cs=srgb&dl=pexels-mikebirdy-381228.jpg&fm=jpg",
				caption: "Wireframe iterations",
				creator: "uxlab",
			},
		],
		[]
	);

	const containerRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const videos = Array.from(container.querySelectorAll("video"));
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const el = entry.target;
					const reel = el.closest(".reel");
					const indexStr = reel?.getAttribute("data-index");
					const idx = indexStr ? parseInt(indexStr, 10) : 0;
					if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
						setCurrentIndex(idx);
						if (el.tagName === "VIDEO") {
							const v = el;
							try {
								v.play().catch(() => {});
							} catch {}
						}
					} else {
						if (el.tagName === "VIDEO") {
							const v = el;
							v.pause();
						}
					}
				});
			},
			{
				root: container,
				threshold: [0.4, 0.6, 0.85],
			}
		);

		videos.forEach((v) => observer.observe(v));
		return () => observer.disconnect();
	}, []);

	// Keyboard navigation between reels
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scrollToIndex = (i) => {
			const clamped = Math.max(0, Math.min(demoPosts.length - 1, i));
			const target = container.querySelector(`.reel[data-index="${clamped}"]`);
			if (target) {
				const top = target.offsetTop;
				container.scrollTo({ top, behavior: "smooth" });
				setCurrentIndex(clamped);
			}
		};

		const onKey = (e) => {
			if (["ArrowDown", "PageDown"].includes(e.key)) {
				e.preventDefault();
				scrollToIndex(currentIndex + 1);
			} else if (["ArrowUp", "PageUp"].includes(e.key)) {
				e.preventDefault();
				scrollToIndex(currentIndex - 1);
			}
		};

		container.addEventListener("keydown", onKey);
		// Make container focusable to receive key events on desktop
		container.setAttribute("tabindex", "0");
		container.focus({ preventScroll: true });

		return () => container.removeEventListener("keydown", onKey);
	}, [currentIndex, demoPosts.length]);

	return (
		<main className="tt-container" ref={containerRef} role="feed" aria-live="polite">
            <Header/>
			{demoPosts.map((post, i) => (
				<Reel key={post.id ?? i} post={post} index={i} />
			))}
		</main>
	);
}

