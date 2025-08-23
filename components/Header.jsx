"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import '../lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <Link href="/login">
          <button className={styles.logIn}>Log In</button>
        </Link>
        <Link href="/signup">
          <button className={styles.signUp}>Sign Up</button>
        </Link>
      </div>
    </header>
  );
}
