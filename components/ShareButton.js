import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faShare } from '@fortawesome/free-solid-svg-icons';
import "./ShareButton.css";
import Toast from './Toast';

export default function ShareButton({postId = null, projectId = null, forceLeft = false}) {
    const [sharePanelOpen, setSharePanelOpen] = useState(false);
    const [panelAlign, setPanelAlign] = useState('right');
    const shareRef = useRef(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef(null);

    async function CopyLink(isProject = false) {
        try {
            // build the link based on what’s being copied
            const url = isProject
                ? `${window.location.origin}/project/${projectId}`
                : `${window.location.origin}/project/${projectId}/post/${postId}`;

            await navigator.clipboard.writeText(url);
            // Reset any existing timer and briefly close toast so it can re-open reliably
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
            }
            setToastOpen(false);
            setToastMessage(isProject ? 'Project link copied!' : 'Post link copied!');
            // small delay to allow state to toggle, then open
            toastTimerRef.current = setTimeout(() => {
                setToastOpen(true);
                toastTimerRef.current = null;
            }, 60);
        } catch (err) {
            setToastOpen(false);
            setToastMessage(err.message || 'An error occurred.');
            // small delay to allow state to toggle, then open
            toastTimerRef.current = setTimeout(() => {
                setToastOpen(true);
                toastTimerRef.current = null;
            }, 60);
        }
    }

    // decide alignment before opening the panel based on available space
    function decideAlignment() {
        if (forceLeft)
        {
            return 'left'
        }

        try {
            const el = shareRef.current;
            if (!el) return 'right';
            const rect = el.getBoundingClientRect();
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            // estimate panel width (fallback) — use 200px as safe default
            const panelWidth = 220;
            return spaceRight < panelWidth && spaceLeft > spaceRight ? 'left' : 'right';
        } catch (e) {
            return 'right';
        }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setSharePanelOpen(false);
            }
        }

        if (sharePanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sharePanelOpen]);

    // clear any timer on unmount
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
                toastTimerRef.current = null;
            }
        }
    }, []);

    return (
        <div ref={shareRef} className='share-container'>
            <FontAwesomeIcon className="share option" icon={faShare} onClick={() => {
                // decide alignment right before toggling
                setPanelAlign(decideAlignment());
                setSharePanelOpen(value => !value);
            }}/>
            
            {sharePanelOpen && <div className={`share-panel ${panelAlign}`}>
                <ul>
                    {(postId && projectId) &&<li className="no-select-pointer" onClick={() => {CopyLink(); setSharePanelOpen(false)}}>
                        <FontAwesomeIcon icon={faLink} />
                        <span>Copy Post Link</span>
                    </li>}
                    {projectId && <li className="no-select-pointer" onClick={() => {CopyLink(true); setSharePanelOpen(false)}}>
                        <FontAwesomeIcon icon={faLink} />
                        <span>Copy Project Link</span>
                    </li>}
                </ul>
            </div> }
            <Toast isOpen={toastOpen} message={toastMessage} onClose={() => setToastOpen(false)} />
        </div>
    )
}
