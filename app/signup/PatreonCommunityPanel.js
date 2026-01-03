import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./PatreonCommunityPanel.css";
import { faPatreon } from '@fortawesome/free-brands-svg-icons';
import { faRocket, faStar, faLockOpen, faUsers, faGem } from '@fortawesome/free-solid-svg-icons';
import PanelOverlay from '@/components/PanelOverlay';

export default function PatreonCommunityPanel({ onClose, isOpen, styles }) {
    return (
        <PanelOverlay panelClass="shrink-max-width shrink-max-height" closeButtonClass='pc-close-button' isOpen={isOpen} onClose={onClose}>
            <div className="pc-panel bold">
                <section className="pc-hero">
                    <div className="pc-hero-media" aria-hidden>
                        <img src="/FlameSpark_Patreon_Community_Graphic.png" alt="" className="pc-hero-img" />
                    </div>
                    <div className="pc-hero-content">
                        <h2 className="titleFont header-size">FlameSpark Patreon Community</h2>
                        <p className="bodyFont body-size pc-hero-sub label-color">Support the vision and get exclusive access to FlameSpark‑Beta.</p>
                        <div className="pc-cta">
                            <a
                                href="https://www.patreon.com/flamespark"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`button-shape bodyFont red-color member-button`}
                            >
                                <FontAwesomeIcon icon={faPatreon} style={{ marginRight: '6px' }} />
                                Visit Our Patreon
                            </a>
                        </div>
                    </div>
                </section>

                <section className="pc-benefits">
                    <h3 className="pc-section-header titleFont">Why Join?</h3>
                    <div className="pc-benefit">
                        <div className="pc-benefit-icon"><FontAwesomeIcon icon={faGem} /></div>
                        <h3 className="titleFont">Support FlameSpark</h3>
                        <p className="bodyFont body-size">Your support keeps us developing and improving FlameSpark.</p>
                    </div>
                    <div className="pc-benefit">
                        <div className="pc-benefit-icon"><FontAwesomeIcon icon={faLockOpen} /></div>
                        <h3 className="titleFont">Beta Access</h3>
                        <p className="bodyFont body-size">Unlock FlameSpark‑Beta with your membership.</p>
                    </div>
                    <div className="pc-benefit">
                        <div className="pc-benefit-icon"><FontAwesomeIcon icon={faStar} /></div>
                        <h3 className="titleFont">Exclusive Perks</h3>
                        <p className="bodyFont body-size">Member‑only posts, updates, collectibles, and behind‑the‑scenes content.</p>
                    </div>
                    <div className="pc-benefit">
                        <div className="pc-benefit-icon"><FontAwesomeIcon icon={faUsers} /></div>
                        <h3 className="titleFont">Community</h3>
                        <p className="bodyFont body-size">Join special discussions and connect with other supporters.</p>
                    </div>
                </section>

                {false && <section className="pc-tiers">
                    <h3 className="pc-section-header titleFont">Membership Tiers</h3>
                    <div className="pc-tier-card">
                        <div className="pc-card-media" aria-hidden>
                            <div className="pc-img-placeholder" />
                        </div>
                        <div className="pc-card-body">
                            <h4 className="titleFont">Standard Supporter</h4>
                            <p className="bodyFont body-size">Support the project and get basic perks.</p>
                        </div>
                    </div>
                    <div className="pc-tier-card">
                        <div className="pc-card-media" aria-hidden>
                            <div className="pc-img-placeholder" />
                        </div>
                        <div className="pc-card-body">
                            <h4 className="titleFont">Supporter+</h4>
                            <p className="bodyFont body-size">Access member posts and community features.</p>
                        </div>
                    </div>
                </section>}

                <section className="pc-steps">
                    <h3 className="pc-section-header titleFont">How It Works</h3>
                    <div className="pc-step">
                        <span className="pc-step-num titleFont">1</span>
                        <div>
                            <h5 className="titleFont">Join the Patreon</h5>
                            <p className="bodyFont body-size">Head to our Patreon page and select a tier (Free trials available).</p>
                        </div>
                    </div>
                    <div className="pc-step">
                        <span className="pc-step-num titleFont">2</span>
                        <div>
                            <h5 className="titleFont">Log in on FlameSpark</h5>
                            <p className="bodyFont body-size">Use “Login With Patreon” to securely link your membership.</p>
                        </div>
                    </div>
                    <div className="pc-step">
                        <span className="pc-step-num titleFont">3</span>
                        <div>
                            <h5 className="titleFont">Enjoy Beta Access</h5>
                            <p className="bodyFont body-size">Participate in beta testing and provide feedback to help shape the future of FlameSpark.</p>
                        </div>
                    </div>
                </section>

                <section className="pc-bottom-cta">
                    <a
                        href="https://www.patreon.com/flamespark"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`button-shape bodyFont red-color member-button`}
                    >
                        <FontAwesomeIcon icon={faPatreon} style={{ marginRight: '6px' }} />
                        Become a Member
                    </a>
                    <button
                        onClick={onClose}
                        className="button-shape bodyFont neutral-color member-button"
                        style={{marginTop: '5px'}}
                    >
                        Close
                    </button>
                    <p className="pc-disclaimer bodyFont body-size">Membership status is verified via Patreon authentication. Some perks may vary by tier.</p>
                </section>
            </div>
        </PanelOverlay>
    );
}