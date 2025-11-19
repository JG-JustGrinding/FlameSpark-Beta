"use client";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube, faPatreon, faDiscord } from '@fortawesome/free-brands-svg-icons';
import socials from '@/lib/socials';
import styles from './SocialLinks.module.css';

export default function SocialLinks({ className = '', excludeExtra = false, showLabels = false, fontSize = null }) {
  return (
    <div className={`${styles.socials} ${className}`} style={fontSize ? { fontSize: fontSize } : {}}>
      <a href={socials.patreon} target="_blank" rel="noopener noreferrer" aria-label="Patreon" className={styles.icon}>
        <FontAwesomeIcon icon={faPatreon} className={fontSize ? styles.fontSizeControl : ''} />
        {showLabels && <span>Patreon</span>}
      </a>
      <a href={socials.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord" className={styles.icon}>
        <FontAwesomeIcon icon={faDiscord} className={fontSize ? styles.fontSizeControl : ''} />
        {showLabels && <span>Discord</span>}
      </a>
    {!excludeExtra && (
        <>
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.icon}>
            <FontAwesomeIcon icon={faInstagram} className={fontSize ? styles.fontSizeControl : ''} />
            {showLabels && <span>Instagram</span>}
          </a>
          <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.icon}>
            <FontAwesomeIcon icon={faYoutube} className={fontSize ? styles.fontSizeControl : ''} />
            {showLabels && <span>YouTube</span>}
          </a>
        </>
      )}
    </div>
  );
}
