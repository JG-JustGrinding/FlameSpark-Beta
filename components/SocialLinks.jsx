"use client";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube, faPatreon, faDiscord } from '@fortawesome/free-brands-svg-icons';
import socials from '@/lib/socials';
import styles from './SocialLinks.module.css';

export default function SocialLinks({ className = '', excludeExtra = false }) {
  return (
    <div className={`${styles.socials} ${className}`}>
      <a href={socials.patreon} target="_blank" rel="noopener noreferrer" aria-label="Patreon" className={styles.icon}>
        <FontAwesomeIcon icon={faPatreon} />
      </a>
      <a href={socials.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord" className={styles.icon}>
        <FontAwesomeIcon icon={faDiscord} />
      </a>
    {!excludeExtra && (
        <>
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.icon}>
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.icon}>
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </>
      )}
    </div>
  );
}
