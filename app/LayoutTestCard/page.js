"use client";

import React, { useRef, useState } from "react";

function randomText(words) {
	const source = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(
		" "
	);
	const len = Math.max(6, Math.min(words, source.length));
	return source.slice(0, len).join(" ") + ".";
}

const demoPosts = Array.from({ length: 12 }).map((_, i) => ({
	id: i + 1,
	title: `Card ${i + 1}`,
	image: `https://picsum.photos/seed/card-${i + 1}/${420 + ((i * 17) % 80)}/${280 + ((i * 11) % 60)}`,
	text: randomText(10 + ((i * 5) % 20)),
}));

export default function CardStackLayoutPage() {
	const [index, setIndex] = useState(0);
	const [drag, setDrag] = useState({ active: false, dx: 0, dy: 0 });
	const [swipe, setSwipe] = useState(null); // 'left' | 'right' | null
	const startRef = useRef({ x: 0, y: 0 });

	const topCard = demoPosts[index];
	const nextCard = demoPosts[index + 1];
	const thirdCard = demoPosts[index + 2];

	const onPointerDown = (e) => {
		const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
		const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
		startRef.current = { x, y };
		setDrag({ active: true, dx: 0, dy: 0 });
	};

	const onPointerMove = (e) => {
		if (!drag.active) return;
		const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
		const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
		const dx = x - startRef.current.x;
		const dy = y - startRef.current.y;
		setDrag((d) => ({ ...d, dx, dy }));
	};

	const completeSwipe = (dir) => {
		setSwipe(dir);
		// After animation out, advance index
		setTimeout(() => {
			setIndex((i) => Math.min(i + 1, demoPosts.length));
			setSwipe(null);
			setDrag({ active: false, dx: 0, dy: 0 });
		}, 250);
	};

	const onPointerUp = () => {
		if (!drag.active) return;
		const threshold = 120;
		if (drag.dx > threshold) {
			completeSwipe("right");
		} else if (drag.dx < -threshold) {
			completeSwipe("left");
		} else {
			// reset
			setDrag({ active: false, dx: 0, dy: 0 });
		}
	};

	const goPrev = () => setIndex((i) => Math.max(0, i - 1));
	const goNext = () => setIndex((i) => Math.min(demoPosts.length - 1, i + 1));

	const rotation = drag.dx * 0.05; // small tilt based on horizontal drag
	const transformStyle = {
		transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${rotation}deg)`,
	};

	return (
		<main className="cardstack-page">
			<h1 className="titleFont" style={{ marginBottom: 10 }}>Card Stack Layout Test</h1>
			<p className="bodyFont label-color" style={{ marginTop: 0, marginBottom: 20 }}>
				Drag left/right to swipe. Buttons work too.
			</p>

			<section className="cardstack" aria-label="Swipeable cards">
				{/* Third card (deep background) */}
				{thirdCard && (
					<article className="card depth-3">
						<img src={thirdCard.image} alt={`${thirdCard.title} image`} />
						<div className="content">
							<h3 className="titleFont">{thirdCard.title}</h3>
							<p className="bodyFont label-color">{thirdCard.text}</p>
						</div>
					</article>
				)}
				{/* Next card (middle) */}
				{nextCard && (
					<article className="card depth-2">
						<img src={nextCard.image} alt={`${nextCard.title} image`} />
						<div className="content">
							<h3 className="titleFont">{nextCard.title}</h3>
							<p className="bodyFont label-color">{nextCard.text}</p>
						</div>
					</article>
				)}
				{/* Top card (interactive) */}
				{topCard && (
					<article
						className={`card depth-1 ${swipe === "left" ? "swipe-left" : ""} ${swipe === "right" ? "swipe-right" : ""}`}
						style={drag.active && !swipe ? transformStyle : undefined}
						onMouseDown={onPointerDown}
						onMouseMove={onPointerMove}
						onMouseUp={onPointerUp}
						onTouchStart={onPointerDown}
						onTouchMove={onPointerMove}
						onTouchEnd={onPointerUp}
						aria-label={`${topCard.title}`}
					>
						<img src={topCard.image} alt={`${topCard.title} image`} />
						<div className="content">
							<h3 className="titleFont">{topCard.title}</h3>
							<p className="bodyFont label-color">{topCard.text}</p>
						</div>
					</article>
				)}
				{!topCard && (
					<div className="end bodyFont">All caught up!</div>
				)}
			</section>

			<div className="controls">
				<button className="button-shape" onClick={goPrev} disabled={index <= 0}>Prev</button>
				<button className="button-shape" onClick={() => completeSwipe("left")} disabled={!topCard}>Swipe Left</button>
				<button className="button-shape" onClick={() => completeSwipe("right")} disabled={!topCard}>Swipe Right</button>
				<button className="button-shape" onClick={goNext} disabled={index >= demoPosts.length - 1}>Next</button>
			</div>

			<style jsx>{`
				.cardstack-page {
					padding: 24px;
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				.cardstack {
					position: relative;
					width: min(720px, 92vw);
					height: min(72vh, 820px);
				}

				.card {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					margin: 0 auto;
					width: 100%;
					height: 100%;
					background: var(--white);
					border: 1px solid rgba(0,0,0,0.08);
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 12px 40px rgba(0,0,0,0.12);
					display: flex;
					flex-direction: column;
					user-select: none;
					touch-action: pan-y;
					transition: transform 250ms ease, opacity 250ms ease;
				}

				.depth-1 { z-index: 3; }
				.depth-2 { z-index: 2; transform: translateY(18px) scale(0.97); }
				.depth-3 { z-index: 1; transform: translateY(34px) scale(0.94); opacity: 0.9; }

				.card img {
					width: 100%;
					height: 58%;
					object-fit: cover;
				}

				.card .content {
					flex: 1;
					padding: 16px 18px 20px;
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				.swipe-left { transform: translate(-120%, 0) rotate(-15deg); opacity: 0; }
				.swipe-right { transform: translate(120%, 0) rotate(15deg); opacity: 0; }

				.controls {
					margin-top: 18px;
					display: flex;
					gap: 10px;
				}

				.end { margin-top: 12px; }

				@media (max-width: 520px) {
					.cardstack { height: 68vh; }
					.card img { height: 54%; }
				}
			`}</style>
		</main>
	);
}

