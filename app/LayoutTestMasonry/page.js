"use client";

import React from "react";

function randomText(words) {
	const source = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(
		" "
	);
	const len = Math.max(6, Math.min(words, source.length));
	return source.slice(0, len).join(" ") + ".";
}

const demoPosts = Array.from({ length: 24 }).map((_, i) => ({
	id: i + 1,
	title: `Demo Post ${i + 1}`,
	image: `https://picsum.photos/seed/masonry-${i + 1}/${400 + ((i * 37) % 200)}/${260 + ((i * 19) % 160)}`,
	text: randomText(8 + ((i * 5) % 35)),
}));

export default function MasonryLayoutTestPage() {
	return (
		<main style={{ padding: "24px" }}>
			<h1 className="titleFont" style={{ marginBottom: 12 }}>Masonry Layout Test</h1>
			<p className="bodyFont label-color" style={{ marginTop: 0, marginBottom: 24 }}>
				Responsive CSS-columns based masonry. Resize window to see columns adjust.
			</p>

			<section className="masonry" aria-label="Masonry posts">
				{demoPosts.map((post) => (
					<article className="masonry-item card" key={post.id}>
						<img src={post.image} alt={`${post.title} image`} />
						<div className="content">
							<h3 className="titleFont">{post.title}</h3>
							<p className="bodyFont label-color">{post.text}</p>
						</div>
					</article>
				))}
			</section>

			<style jsx>{`
				.masonry {
					column-count: 4;
					column-gap: 1.25rem;
				}

				.masonry-item {
					break-inside: avoid;
					-webkit-column-break-inside: avoid;
					background: var(--white);
					border: 1px solid rgba(0,0,0,0.1);
					border-radius: 12px;
					display: inline-block; /* required for CSS columns */
					margin: 0 0 1.25rem;
					width: 100%;
					overflow: hidden;
					box-shadow: 0 6px 20px rgba(0,0,0,0.06);
				}

				.masonry-item img {
					display: block;
					width: 100%;
					height: auto;
				}

				.masonry-item .content {
					padding: 12px 14px 16px;
					display: flex;
					flex-direction: column;
					gap: 6px;
				}

				.masonry-item h3 {
					margin: 0;
					font-size: 1.1rem;
				}

				.masonry-item p {
					margin: 0;
					font-size: 0.95rem;
				}

				@media (max-width: 1280px) {
					.masonry { column-count: 3; }
				}
				@media (max-width: 900px) {
					.masonry { column-count: 2; }
				}
				@media (max-width: 600px) {
					.masonry { column-count: 1; }
				}
			`}</style>
		</main>
	);
}

