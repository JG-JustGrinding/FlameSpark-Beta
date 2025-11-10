"use client";
import React from 'react';
import styles from './Header.module.css';
import Link from 'next/link';

// Reusable notification item component
export default function Notification({ href = '#', colorClass = '', iconSrc = '/placeholder_generic.svg', title = 'Notification', timestamp = '', message = '' }) {
  const Wrapper = href ? Link : React.Fragment;

  // If using Link, Next requires <a> inside; otherwise render a div
  if (href) {
    return (
      <a href={href} className={styles.notifItem}>
        {colorClass && <div className={`${styles.colorBanner} ${styles[colorClass] || ''}`}></div>}
        <div className={styles.notifIcon}>
          <img src={iconSrc} alt="Notification Icon" />
        </div>
        <div className={styles.notifContent}>
          <div className={styles.titleAndDate}>
            <strong className="titleFont notifTitle reset">{title}</strong>
            <span className={`${styles.notifTimestamp} label-color`}>{timestamp}</span>
          </div>
          <p className={`bodyFont ${styles.notifMessage} reset label-color`}>{message}</p>
        </div>
      </a>
    );
  }

  return (
    <div className={styles.notifItem}>
      {colorClass && <div className={`${styles.colorBanner} ${styles[colorClass] || ''}`}></div>}
      <div className={styles.notifIcon}>
        <img src={iconSrc} alt="Notification Icon" />
      </div>
      <div className={styles.notifContent}>
        <div className={styles.titleAndDate}>
          <strong className="titleFont notifTitle reset">{title}</strong>
          <span className={`${styles.notifTimestamp} label-color`}>{timestamp}</span>
        </div>
        <p className={`bodyFont ${styles.notifMessage} reset label-color`}>{message}</p>
      </div>
    </div>
  );
}
