import React from 'react';
import './FlamepointsTeaser.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlameCurved, faStar, faUsers, faRoad, faComments, faList, faGem } from '@fortawesome/free-solid-svg-icons';

export default function FlamepointsTeaser({ projectTitle = '', points = 0, nextTierPoints = 100, onClose = () => {} }) {
    const remaining = Math.max(0, nextTierPoints - (points || 0));

    return (
        <div className="flamepoints-teaser">
            <div className="points-header">
                <FontAwesomeIcon icon={faFireFlameCurved} className="big-icon" />
                <div className="title-block">
                    <h2 className="points-teaser-title">FlamePoints</h2>
                    <p className="subtitle">Award points to projects to unlock extra features and community perks.</p>
                </div>
            </div>

            <div className="body">
                <p className="lead">FlamePoints are points that supporters can give that help projects unlock amazing new features!</p>
                <ul className="benefits">
                    <li><FontAwesomeIcon icon={faStar} /> Stickers & Themes</li>
                    <li><FontAwesomeIcon icon={faList} /> To-Do List & Task Manager</li>
                    <li><FontAwesomeIcon icon={faRoad} /> Customizable Timeline</li>
                    <li><FontAwesomeIcon icon={faComments} /> Reactions & Enhanced Comments</li>
                    <li><FontAwesomeIcon icon={faUsers} /> Community Space (Project chat & discussion spaces)</li>
                    <li><FontAwesomeIcon icon={faGem} /> & Much More!</li>
                </ul>

                <p className="body caption-size label-color bold">FlamePoints are a way for supporters to recognize and reward the efforts of project creators. As the project earns more points, it unlocks more and more features that enhance both the creator's and supporters' experience!</p>
            </div>

            <div className="actions">
                <button className="button-shape bodyFont" onClick={onClose}>Close</button>
                <a href="/support" target="_blank" rel="noopener noreferrer"><button className="button-shape bodyFont red-color">Become a Member!</button></a>
            </div>
        </div>
    );
}
