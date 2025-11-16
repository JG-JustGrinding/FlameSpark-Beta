"use client";
import { supabase } from '@/lib/supabaseClient';
import React from 'react';
import styles from './Header.module.css';
import Link from 'next/link';

export default function Notification({ id = null, href = '#', colorClass = '', iconSrc = '/placeholder_generic.svg', title = 'Notification', timestamp = '', message = '' }) {

  const handleClick = async (e) => {
    e.preventDefault();
    // Mark notification as read
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    // Navigate to the link
    window.location.href = href;
  }

  if (href) {
    return (
      <a href={href} className={styles.notifItem} onClick={handleClick}>
        {colorClass && <div className={`${styles.colorBanner} ${styles[colorClass] || ''}`}></div>}
        <div className={styles.notifIcon}>
          <img src={iconSrc ? iconSrc : "/placeholder_generic.svg"} alt="Notification Icon" />
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
