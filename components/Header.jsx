"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import '../lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faBullhorn, faInbox, faUser, faGear, faInfo, faPencil, faBell as faBellSolid, faGlobe, faInfoCircle, faStar as faStarSolid, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { faBell, faStar } from '@fortawesome/free-regular-svg-icons';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import Notification from './notification';
import NotificationPanel from './NotificationPanel';
import SocialLinks from './SocialLinks';

export default function Header({ isDashboardHeader = false, searchFieldText = "", project = null, onOpenMobileMenu = null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchFieldText);
  const [searchOpen, setSearchOpen] = useState(false);

  const { user, userSet, avatar, username, handleLogout } = useUser();

  const avatarRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notifRef = useRef(null);
  const notifButtonRef = useRef(null);
  const socialRef = useRef(null);
  const socialButtonRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [goldenBadge, setGoldenBadge] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [notifFilter, setNotifFilter] = useState('');
  const notifFilters = ["All", "Projects", "Interactions", "Completions"];
  const socialEnabled = true;

  const [unreadByFilter, setUnreadByFilter] = useState({ All: 0, Projects: 0, Interactions: 0, Completions: 0 });
  const [supressCompletionsUnreadFilterIcon, setSupressCompletionsUnreadFilterIcon] = useState({ All: false, Projects: false, Interactions: false, Completions: false });
  const [socialOpen, setSocialOpen] = useState(false);

  const search = () => {
    if (!searchQuery.trim()) return;
  
    const url = `/search?q=${encodeURIComponent(searchQuery)}`;

    if (pathname === '/search') {
        window.location.href = url;
      } else {
        router.push(url);
    }
  }

  useEffect(() => {
    if (user) {
      setNotifFilter('All');
    }
  }, [userSet, user]);
useEffect(() => {
    // Animate badge briefly when unreadCount increases
    if (unreadCount > 0) {
      setBadgePulse(true);
      const t = setTimeout(() => setBadgePulse(false), 900);
      return () => clearTimeout(t);
    }
}, [unreadCount]);

  // Click-outside & Escape handling to close panels
  useEffect(() => {
    function handleClickOutside(e) {
      // Close user panel if click is outside both dropdown and avatar
      if (userPanelOpen) {
        if (userDropdownRef.current && !userDropdownRef.current.contains(e.target) && !avatarRef.current?.contains(e.target)) {
          setUserPanelOpen(false);
        }
      }

      // Close notif panel if click is outside both notif panel and its button
      if (notifOpen) {
        if (notifRef.current && !notifRef.current.contains(e.target) && !notifButtonRef.current?.contains(e.target)) {
          setNotifOpen(false);
        }
      }

      // Close social panel if click is outside both social dropdown and its button
      if (socialOpen) {
        if (socialRef.current && !socialRef.current.contains(e.target) && !socialButtonRef.current?.contains(e.target)) {
          setSocialOpen(false);
        }
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') {
        setUserPanelOpen(false);
        setNotifOpen(false);
        setSocialOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [userPanelOpen, notifOpen, socialOpen]);

  const updateNotifications = async (opening) => {
    if (!user) return;

    if (!opening)
    {
      return
    }

    setUnreadCount(0 + unreadByFilter.Completions);
    setUnreadByFilter(prev => {
      const updated = {};

      for (const key in prev) {
        updated[key] = key.toLowerCase() === "completions" ? prev[key] : 0;
      }

      return updated;
    });

    await supabase
    .from('profiles')
    .update({ notifications_last_checked_at: new Date().toISOString() })
    .eq('id', user?.id);
  }

useEffect(() => {
  if (!user) return;

  setSupressCompletionsUnreadFilterIcon(false);

  const fetchUnread = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("notifications_last_checked_at")
      .eq("id", user?.id)
      .single();

    if (!profile) return;

    const { data: notifs } = await supabase
      .from("notifications")
      .select("id, category, created_at")
      .eq("user_id", user?.id)
      .or(
        // normal notifications after last_checked
        `created_at.gt.${profile.notifications_last_checked_at},` +
        // completion notifications that are unread
        `and(category.eq.completions:project_completion,is_read.eq.false)`
      )
      .order("created_at", { ascending: false });

    if (!notifs) return;

    const { count: completions } = await supabase
      .from("notifications")
      .select('*', { count: 'exact', head: true })
      .eq("user_id", user?.id)
      .eq("is_read", false)
      .eq("category", "completions:project_completion");

    // Count total unread
    setUnreadCount(notifs.length);

    // Assign to filters
    const counters = {
      All: notifs.length,
      Projects: 0,
      Interactions: 0,
      Completions: completions || 0,
    };

    for (const n of notifs) {
      const base = n.category.split(":")[0].trim().toLowerCase();
      if (base === "projects") counters.Projects++;
      if (base === "interactions") counters.Interactions++;
    }

    if (counters.Completions > 0) {
      setGoldenBadge(true);
    }

    setUnreadByFilter(counters);
  };

  fetchUnread();
}, [user]);

useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel("user_notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user?.id}`,
      },
      (payload) => {
        // A new notification arrived
        setUnreadCount(prev => prev + 1);

        // Update filter unread counts
        setUnreadByFilter(prev => {
          const newCounts = { ...prev, All: prev.All + 1 };

          if (payload.new.category.toLowerCase().includes("projects")) newCounts.Projects++;
          if (payload.new.category.toLowerCase().includes("interactions")) newCounts.Interactions++;
          if (payload.new.category.toLowerCase().includes("completions")) newCounts.Completions++;

          return newCounts;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

useEffect(() => {
    const handle = async () => {
      // When changing to completions filter, clear unread for that filter
      if (notifFilter.toLowerCase() == 'completions') {
        setSupressCompletionsUnreadFilterIcon(true);
      }

      // Subtract unread count for selected filter
      setUnreadCount(prev => {
        const filterUnread = unreadByFilter[notifFilter] || 0;
        return Math.max(prev - filterUnread, 0);
      });

      // update the other filters to remove the count of other filters because user has viewed notifications
      setUnreadByFilter(prev => {
        const updated = {};

        for (const key in prev) {
          if (notifFilter.toLowerCase() === key.toLowerCase() || notifFilter.toLowerCase() === 'all') {
            updated[key] = 0;
          } else {
            updated[key] = prev[key];
          }
        }
        return updated;
      });
      
      await supabase
      .from('profiles')
      .update({ notifications_last_checked_at: new Date().toISOString() })
      .eq('id', user?.id);
    }

  handle();

  }, [notifFilter]);

  return (
    <header className={`${styles.header} titleFont` + (isDashboardHeader ? ` ${styles.dashboardNav}` : '')}>

      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.hamburger} onClick={onOpenMobileMenu ? onOpenMobileMenu : () => setMobileOpen(!mobileOpen)}>
          <FontAwesomeIcon icon={faBars} className={styles.menuButton} />
        </div>

        <a className={styles.logoA} href="/">
          <img src="/logo_NoPadding_Transparent.png" alt="FlameSpark logo"></img>
        </a>
      </div>

      {isDashboardHeader && 
      <>
        {project &&
        <>
        </>
        }
      </>
      }

      <nav className={styles.navLinks}>
      {!isDashboardHeader ? (
        <>
          <a href="/">Discover</a>
          <a href="/home">Home</a>
          <a href="/explore">Explore</a>
          <a href="/create">Create</a>
        </>
      ) : (
        <>
          <a href={`/project/${project.id}/preview`}>Project Preview</a>
          <a href={`/project/${project.id}`}>View Project</a>
          <a href="/">Exit</a>
        </>
      )}
      </nav>

      {!isDashboardHeader && (<>
      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
      >
        <nav className={styles.navLinksMobile}>
          <a href="/">Discover</a>
          <a href="/home">Home</a>
          <a href="/explore">Explore</a>
          <a href="/create">Create</a>
          {!user && <a href="/blogs">Blogs</a>}
        </nav>
        {/* Mobile menu search button (default). Hidden on extremely small screens. */}
        <div className={styles.mobileMenuSearchButtonContainer}>
          <button
            className={styles.mobileMenuSearchButton}
            onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
            aria-label="Open search"
          >
            <Image src="/search.svg" alt="Search" width={20} height={20} />
          </button>
        </div>
        {/* Inline search input shown only on extremely small screens via CSS */}
        <div className={styles.mobileMenuSearchInline}>
          <div className={styles.searchContainer}>
            <input
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setMobileOpen(false), search())}
            />
            <button
              className={styles.searchIconContainer}
              onClick={() => { setMobileOpen(false); search(); }}
              aria-label="Search"
            >
              <Image src="/search.svg" alt="Search" width={20} height={20} />
            </button>
          </div>
        </div>
        {!user && <div className={styles.mobileSocials}>
          <SocialLinks />
        </div>}
        <div
          className={styles.closeButton}
          onClick={() => setMobileOpen(false)}
        >
        <FontAwesomeIcon icon={faCircleXmark} />
        </div>
      </div>

      <div className={`${styles.searchContainer} ${styles.hiddenMobile}`}>
        <input placeholder="Search here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
        <button className={styles.searchIconContainer} onClick={() => {search()}}>
          <Image src="/search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>

      {searchOpen && <div className={`${styles.mobileSearch}`}>
        <p className={`bodyFont no-select-pointer ${styles.mobileSearchClose}`} role="button" onClick={() => setSearchOpen(false)}><FontAwesomeIcon icon={faCircleXmark} /></p>
        <div className={`${styles.searchContainer}`}>
          <input placeholder="Search here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
          <button className={styles.searchIconContainer} onClick={() => {search()}}>
            <Image src="/search.svg" alt="Search" width={20} height={20} />
          </button>
        </div>
      </div>}

      <button className={`${styles.mobileSearchButton} ${styles.mobileOnly} ${user ? "" : styles.unlogged}`} onClick={() => setSearchOpen(true)}>
        <Image src="/search.svg" alt="Search" width={20} height={20} />
      </button>
      </>)}

      {/* Auth buttons */}
      <div className={`${styles.authButtons} ${user ? "" : styles.unlogged}`}>
          {userSet && (
            <>
              {user ? (
                <>
                <div className={styles.userSection}>
                  <button
                    ref={notifButtonRef}
                    className={styles.notifButton}
                    onClick={() => {
                      const opening = !notifOpen;
                      setNotifOpen(opening);
                      setUserPanelOpen(false);
                      if (opening) {
                        updateNotifications(opening);
                      }
                    }}
                    aria-label="Open notifications"
                    aria-haspopup="true"
                    aria-expanded={notifOpen}
                  >
                    <FontAwesomeIcon icon={notifOpen ? faBellSolid : faBell} className={styles.inbox} />
                    {unreadCount > 0 && (
                      <span className={`${styles.notifBadge} ${badgePulse ? styles.pulse : ""} ${goldenBadge ? styles.golden : ""}`} aria-hidden="true">
                        {unreadCount > 99 ? '99+' : (unreadCount > 9 ? `${unreadCount}` : `${unreadCount}`)}
                      </span>
                    )}
                  </button>
                  
                  <img ref={avatarRef} src={avatar} alt="User Avatar" className={`${styles.pfp} pfp-shape`}
                    onClick={() => {setUserPanelOpen(!userPanelOpen); setNotifOpen(false); }} />
                </div>
                <div ref={userDropdownRef} className={`${styles.userDropdown} ${userPanelOpen ? styles.open : ""}`}>
                  <div className={`${styles.userDisplay} ${styles.titleFont}`}>
                    <img src={avatar} alt="User Avatar" className="pfp pfp-shape"></img>
                    <span>{username}</span>
                  </div>
                  <div className={`${styles.options} ${styles.bodyFont}`}>
                    <a href={`/user/${user?.id}`}>
                      <FontAwesomeIcon className={styles.optionIcon} icon={faUser} />
                      <span className="bodyFont">View Profile</span>
                    </a>
                    <a href="/account">
                      <FontAwesomeIcon className={styles.optionIcon} icon={faGear} />
                      <span className="bodyFont">Account</span>
                    </a>
                    <button className={`${styles.logoutButton} bodyFont`}
                            onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                  <span className={`${styles.closeButton} ${styles.bodyFont}`} onClick={() => {setUserPanelOpen(false)}}>X</span>
                </div>
                </>
              ) : (
                <>
                  <div className={styles.socialWrapper}>
                    <button
                      ref={socialButtonRef}
                      className={styles.socialButton}
                      onClick={() => { setSocialOpen(!socialOpen); setUserPanelOpen(false); setNotifOpen(false); }}
                      aria-label="Open social links"
                      aria-haspopup="true"
                      aria-expanded={socialOpen}
                    >
                      {socialEnabled && <FontAwesomeIcon className={styles.socialWrapperIcon} icon={faBullhorn} />}
                    </button>
                    <div ref={socialRef} className={`${styles.socialDropdown} ${socialOpen ? styles.open : ''}`}>
                      <a href="/blogs" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faNewspaper} />
                        Blogs
                      </a>
                      <div style={{ borderTop: '1px solid #eef2f7', marginBottom: '8px' }}></div>
                      <SocialLinks showLabels={false} fontSize={'.9rem'} />
                    </div>
                  </div>
                  <a href="/login"><button className={`${styles.logIn} ${styles.animate}`}>Log In</button></a>
                  <a href="/signup"><button className={`${styles.signUp} ${styles.animate}`}>Sign Up</button></a>
                </>
              )}
            </>
          )}
      </div>
      {/* Notification panel */}
      <NotificationPanel
        panelRef={notifRef}
        open={notifOpen}
        filters={notifFilters}
        activeFilter={notifFilter}
        onChangeFilter={setNotifFilter}
        unreadByFilter={unreadByFilter}
        suppressCompletionFilterIcon={supressCompletionsUnreadFilterIcon}
        user={user}
      />
    </header>
  );
}
