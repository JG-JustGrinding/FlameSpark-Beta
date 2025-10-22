import React from 'react';
import './FlamepointsTeaser.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlameCurved, faStar, faUsers, faRoad, faComments } from '@fortawesome/free-solid-svg-icons';

export default function FlamepointsTeaser({ projectTitle = '', points = 0, nextTierPoints = 100, onClose = () => {} }) {
    const remaining = Math.max(0, nextTierPoints - (points || 0));

    return (
        <div className="flamepoints-teaser">
            <div className="header">
                <FontAwesomeIcon icon={faFireFlameCurved} className="big-icon" />
                <div className="title-block">
                    <h2 className="title">FlamePoints</h2>
                    <p className="subtitle">Award points to projects to unlock exclusive features and community perks.</p>
                </div>
            </div>

            <div className="body">
                <p className="lead">Give support to {projectTitle ? `"${projectTitle}"` : 'this project'} — FlamePoints help unlock features like:</p>
                <ul className="benefits">
                    <li><FontAwesomeIcon icon={faRoad} /> Timeline (project history & milestones)</li>
                    <li><FontAwesomeIcon icon={faUsers} /> Community Space (project-specific discussions)</li>
                    <li><FontAwesomeIcon icon={faComments} /> Enhanced Comments & Reactions</li>
                    <li><FontAwesomeIcon icon={faStar} /> Stickers & Theme Unlocks</li>
                </ul>

                <div className="progress-panel">
                    <div className="progress-info bodyFont">{points || 0} FlamePoints · {remaining} until next upgrade</div>
                    <div className="progress-bar" aria-hidden>
                        <div className="progress-fill" style={{ width: `${Math.min(100, ((points||0) / nextTierPoints) * 100)}%` }} />
                    </div>
                </div>

                <p className="body caption-size">Anyone can award FlamePoints — they're a community signal. As the project earns more points it unlocks features that help collaborators connect and showcase progress.</p>
            </div>

            <div className="actions">
                <button className="button-shape bodyFont" onClick={onClose}>Close</button>
                <a href="/support" target="_blank" rel="noopener noreferrer"><button className="button-shape bodyFont red-color">Become a Member!</button></a>
            </div>
        </div>
    );
}
