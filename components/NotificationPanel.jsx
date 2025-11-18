"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css"; // Reuse existing header styles
import Notification from "./notification";
import SocialLinks from "./SocialLinks";
import { fetchUserNotifications, timeAgo } from "@/lib/projectFunctions";
import { BetterPaginator } from "@/lib/infinitePostFeed";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

export default function NotificationPanel({
  panelRef,
  open,
  filters = [],
  activeFilter,
  onChangeFilter,
  unreadByFilter = {},
  suppressCompletionFilterIcon = false,
  user = null,
}) {
  const [update, setUpdate] = useState(false);
  const [notifications, setNotifications] = useState([]);

  function getNotificationColor(category, isRead) {
    let postType = category.split(':')[1]?.trim().toLowerCase();

    switch (postType) {
      case "project_post":
        return "red";
      case "project_join":
        return "orange";
      case "like_post":
        return "blue";
      case "post_comment":
        return "green";
      case "comment_reply":
        return "green-accented";
      case "poll_vote":
        return "blue-accented";
      case "project_completion":
        return isRead ? "golden-plain" : "golden";
      default:
        return "blue";
    }
  }

  useEffect(() => {
    if (open) {
      setUpdate(true);
    }
  }, [open]);

  return (
    <div
      ref={panelRef}
      className={`${styles.notifPanel} ${open ? styles.open : ""}`}
      aria-label="Notifications panel"
    >
      <div className={styles.notifHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <strong style={{fontSize: '1.35rem'}}>Notifications</strong>
          <a href="/blogs"style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faNewspaper} />
            <h4 className="reset" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Blogs</h4>
          </a>
        </div>
        <div
          className={styles.notifFilters}
          role="tablist"
          aria-label="Notification filters"
        >
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.notifFilter} ${activeFilter === f ? styles.active : ""}`}
              onClick={() => onChangeFilter && onChangeFilter(f)}
              role="tab"
              aria-selected={activeFilter === f}
            >
              {f}
              {(unreadByFilter[f] > 0) && !(f == 'Completions' && suppressCompletionFilterIcon) && f !== 'All' && (
                <span
                  className={`${styles.notifDot} ${f === "Completions" ? styles.golden : ""}`}
                  aria-hidden="true"
                ></span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className={`${styles.notifList} bodyFont`}>
        <BetterPaginator
            fetchFunction={fetchUserNotifications}
            items={notifications}
            setItems={setNotifications}
            projectId={user?.id}
            renderItem={(notif, idx) => (
                <Notification
                id={notif.id}
                href={notif.href || '#'}
                colorClass={getNotificationColor(notif.category, notif.is_read)}
                iconSrc={notif.icon}
                title={notif.title}
                timestamp={timeAgo(notif.created_at)}
                message={notif.message}
                key={idx}
                />
            )}
            limit={10}
            filter={activeFilter}
            noneFoundObject={<div className={styles.notifItemNoNew}><i>No new notifications</i></div>}
            forceUpdate={update}
            setForceUpdate={setUpdate}
            onReset={() => { panelRef.current?.scrollTo(0, 0); }}
            firstFetchLoadingObject={<><div className={styles.loadingBar} /><div className={styles.loadingSpinner} /></>}
          />
      </div>
      <div className={styles.notifFooter}>
        <SocialLinks />
      </div>
    </div>
  );
}
