"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import '../lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInbox, faUser, faGear, faInfo, faPencil } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userSet, setUserSet] = useState(false);
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(null);
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
      } else {
        setAvatar(null);
        setUsername(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // redirect to homepage after logout
  };


  return (
    <header className={styles.header}>
      {/* Logo */}
      <a href="">Logo</a>

      {/* Desktop nav */}
      <nav className={styles.navLinks}>
        <Link href="#">Discover</Link>
        <a href="#">Home</a>
        <a href="#">Quick Find</a>
        <a href="#">Create</a>
      </nav>

      {/* Hamburger (mobile) */}
      <div
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
      >
        <FontAwesomeIcon icon={faBars} className={styles.menuButton} />
      </div>

      {/* Mobile menu */}
      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}
      >
        <nav className={styles.navLinksMobile}>
          <a href="#">Discover</a>
          <a href="#">Home</a>
          <a href="#">Quick Find</a>
          <a href="#">Create</a>
        </nav>
        <div
          className={styles.closeButton}
          onClick={() => setMobileOpen(false)}
        >
        <FontAwesomeIcon icon={faCircleXmark} />
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search here..." />
        <button className={styles.searchIconContainer}>
          <Image src="/search.svg" alt="Search" width={20} height={20} />
        </button>
      </div>
      
      {/* Auth buttons */}
      <div className={styles.authButtons}>
          {userSet && (
            <>
              {user ? (
                <>
                <div className={styles.userSection}>
                  <FontAwesomeIcon icon={faInbox} className={styles.inbox} />
                  <img src={avatar} alt="User Avatar" className={styles.pfp}
                        onClick={() => {setUserPanelOpen(!userPanelOpen)}}></img>
                </div>
                <div className={`${styles.userDropdown} ${userPanelOpen ? styles.open : ""}`}>
                  <div className={`${styles.userDisplay} ${styles.titleFont}`}>
                    <img src={avatar} alt="User Avatar" className="pfp"></img>
                    <span>{username}</span>
                  </div>
                  <div className={`${styles.options} ${styles.bodyFont}`}>
                    <div>
                      <FontAwesomeIcon className={styles.optionIcon} icon={faUser} />
                      <span className="bodyFont">View Profile</span>
                    </div>
                    <div>
                      <FontAwesomeIcon className={styles.optionIcon} icon={faGear} />
                      <span className="bodyFont">Account</span>
                    </div>
                    <div>
                      <FontAwesomeIcon className={styles.optionIcon} icon={faInfo} />
                      <span className="bodyFont">About Us</span>
                    </div>
                    <div>
                      <FontAwesomeIcon className={styles.optionIcon} icon={faPencil} />
                      <span className="bodyFont">Contact Us</span>
                    </div>
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
                  <Link href="/login"><button className={`${styles.logIn} ${styles.animate}`}>Log In</button></Link>
                  <Link href="/signup"><button className={`${styles.signUp} ${styles.animate}`}>Sign Up</button></Link>
                </>
              )}
            </>
          )}
      </div>
    </header>
  );
}
