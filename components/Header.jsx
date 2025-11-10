"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import '../lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInbox, faUser, faGear, faInfo, faPencil, faBell as faBellSolid, faInfoCircle, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faBell, faStar } from '@fortawesome/free-regular-svg-icons';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import Notification from './notification';
import SocialLinks from './SocialLinks';

export default function Header({ forceAuthRedirect = false, isDashboardHeader = false, searchFieldText = "", project = null, onOpenMobileMenu = null }) {
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
  const [notifFilter, setNotifFilter] = useState('All');
  const notifFilters = ["All", "Projects", "Interactions", "Completions"];
  const socialEnabled = true;

  // track unread counts per category; initially zero — you can wire these from the server
  const [unreadByFilter, setUnreadByFilter] = useState({ All: 0, Projects: 0, Interactions: 0, Completions: 0 });
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
    if (userSet && user == null && forceAuthRedirect) {
      router.push('/login');
    }
  }, [userSet, user, forceAuthRedirect]);

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

  return (
    <header className={`${styles.header} titleFont`}>

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
          <a href="/">Discover</a>
          <a href={`/project/${project.id}/preview`}>Project Preview</a>
          <a href={`/project/${project.id}`}>View Project</a>
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
        </nav>
        {/* Mobile menu search button: visible inside the mobile menu (helpful for very small screens) */}
        <div className={styles.mobileMenuSearchButtonContainer}>
          <button
            className={styles.mobileMenuSearchButton}
            onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
            aria-label="Open search"
          >
            <Image src="/search.svg" alt="Search" width={20} height={20} />
          </button>
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
        <p className="bodyFont label-color no-select-pointer" onClick={() => setSearchOpen(false)}>X</p>
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
                        /* mark as read when opened (clear total badge) */
                        setUnreadCount(0);
                        /* clear unread for the currently selected filter */
                        setUnreadByFilter(prev => ({ ...prev, [notifFilter]: 0, All: 0 }));
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
                    <a href={`/user/${user.id}`}>
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
                  <a href="/login"><button className={`${styles.logIn} ${styles.animate}`}>Log In</button></a>
                  <a href="/signup"><button className={`${styles.signUp} ${styles.animate}`}>Sign Up</button></a>
                  <div className={styles.socialWrapper}>
                    <button
                      ref={socialButtonRef}
                      className={styles.socialButton}
                      onClick={() => { setSocialOpen(!socialOpen); setUserPanelOpen(false); setNotifOpen(false); }}
                      aria-label="Open social links"
                      aria-haspopup="true"
                      aria-expanded={socialOpen}
                    >
                      {socialEnabled && <FontAwesomeIcon className={styles.socialWrapperIcon} icon={socialOpen ? faStarSolid : faStar} />}
                    </button>
                    <div ref={socialRef} className={`${styles.socialDropdown} ${socialOpen ? styles.open : ''}`}>
                      <SocialLinks />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
      </div>
      {/* Notification panel */}
      <div ref={notifRef} className={`${styles.notifPanel} ${notifOpen ? styles.open : ""}`}>
        <div className={styles.notifHeader}>
          <strong>Notifications</strong>
          <div className={styles.notifFilters} role="tablist" aria-label="Notification filters">
            {notifFilters.map((f) => (
              <button
                key={f}
                className={`${styles.notifFilter} ${notifFilter === f ? styles.active : ''}`}
                onClick={() => setNotifFilter(f)}
                role="tab"
                aria-selected={notifFilter === f}
              >
                {f}
                {unreadByFilter[f] > 0 && <span className={`${styles.notifDot} ${f === "Completions" ? styles.golden : ""}`} aria-hidden="true"></span>}
              </button>
            ))}
          </div>
        </div>
        <div className={`${styles.notifList} bodyFont`}>
          {/* Placeholder - integrate real notifications later; filter state is available as `notifFilter` */}
          <div className={styles.notifItemNoNew}>No new notifications</div>
          <Notification
            href="#"
            colorClass="red"
            iconSrc="/placeholder_generic.svg"
            title="Notification Title"
            timestamp="2h ago"
            message="This is a sample notification content."
          />
        </div>
        {/* Sticky social links footer inside the notification panel */}
        <div className={styles.notifFooter}>
          <SocialLinks />
        </div>
      </div>
    </header>
  );
}
