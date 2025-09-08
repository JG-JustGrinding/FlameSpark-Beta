"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import '../lib/fontawesome'
import { useUser } from "@/lib/useUser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInbox, faUser, faGear, faInfo, faPencil } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";


export default function Header({ forceAuthRedirect = false, isDashboardHeader = false, project = null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  const { user, userSet, avatar, username, handleLogout } = useUser();

  useEffect(() => {
    if (userSet && user == null && forceAuthRedirect) {
      router.push('/login');
    }
  }, [userSet, user, forceAuthRedirect]);

  return (
    <header className={`${styles.header} titleFont`}>
      {/* Logo */}
      <a href="">Logo</a>

      {isDashboardHeader && 
      <>
        {project &&
        <>

        </>
        }
      </>
      }

      {!isDashboardHeader && (<>
      <nav className={styles.navLinks}>
        <a href="/">Discover</a>
        <a href="#">Home</a>
        <a href="#">Quick Find</a>
        <a href="/create">Create</a>
      </nav>

      <div
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
      >
        <FontAwesomeIcon icon={faBars} className={styles.menuButton} />
      </div>

      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
      >
        <nav className={styles.navLinksMobile}>
          <a href="/">Discover</a>
          <a href="#">Home</a>
          <a href="#">Quick Find</a>
          <a href="/create">Create</a>
        </nav>
        <div
          className={styles.closeButton}
          onClick={() => setMobileOpen(false)}
        >
        <FontAwesomeIcon icon={faCircleXmark} />
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input placeholder="Search here..." />
        <button className={styles.searchIconContainer}>
          <Image src="/search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>
      </>)}

      {/* Auth buttons */}
      <div className={styles.authButtons}>
          {userSet && (
            <>
              {user ? (
                <>
                <div className={styles.userSection}>
                  <FontAwesomeIcon icon={faInbox} className={styles.inbox} />
                  <img src={avatar} alt="User Avatar" className={`${styles.pfp} pfp-shape`}
                        onClick={() => {setUserPanelOpen(!userPanelOpen)}}></img>
                </div>
                <div className={`${styles.userDropdown} ${userPanelOpen ? styles.open : ""}`}>
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
                </>
              )}
            </>
          )}
      </div>
    </header>
  );
}
