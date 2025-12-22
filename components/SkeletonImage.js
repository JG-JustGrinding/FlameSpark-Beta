"use client";

import React, { useState, useEffect, useRef } from "react";

export default function SkeletonImage({
	src,
	alt = "",
	className = "",
    imageClassName = "",
	skeletonClassName = "skeleton",
	style,
	imgStyle,
	loading = "lazy",
	onLoad,
	onError,
}) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);
	const imgRef = useRef(null);

	const handleLoad = (e) => {
		setLoaded(true);
		if (onLoad) onLoad(e);
	};

	const handleError = (e) => {
		setError(true);
		if (onError) onError(e);
	};

	// If the image is served from cache, onLoad may not fire predictably across browsers.
	// Check `complete`/`naturalWidth` after mount and when `src` changes.
	useEffect(() => {
		setLoaded(false);
		setError(false);

		const img = imgRef.current;
		if (img && img.complete && img.naturalWidth > 0) {
			setLoaded(true);
		}
	}, [src]);

	return (
		<div className={className} style={style}>
			{!loaded && !error && <div className={skeletonClassName} style={{width: '100%', height: '100%'}} />}
			{!error && (
				<img
					src={src}
					alt={alt}
					loading={loading}
					style={{
						...(imgStyle || {}),
						opacity: loaded ? 1 : 0,
						transition: "opacity 200ms ease",
						width: '100%',
						height: '100%',
					}}
					onLoad={handleLoad}
					onError={handleError}
					ref={imgRef}
                    className={imageClassName}
				/>
			)}
			{error && <div className={skeletonClassName} style={{width: '100%', height: '100%'}} />}
		</div>
	);
}

