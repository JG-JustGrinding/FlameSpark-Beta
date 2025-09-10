'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './Carousel.module.css';

const Carousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % images.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className={`${styles.carouselContainer}`}>
      <div className={styles.imageWrapper}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i}`}
            className={`${styles.image} ${i === currentIndex ? styles.active : ''}`}
          />
        ))}
      </div>

      <button className={`${styles.nav} ${styles.left}`} onClick={prevSlide}>
        &#10094;
      </button>
      <button className={`${styles.nav} ${styles.right}`} onClick={nextSlide}>
        &#10095;
      </button>

      <div className={styles.dotsContainer}>
        {images.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;