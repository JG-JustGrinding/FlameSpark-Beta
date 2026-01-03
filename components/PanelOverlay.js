import { useEffect } from "react";
import "./PanelOverlay.css";
import '@/lib/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export default function PanelOverlay({ isOpen, onClose, children, disableClose = false, panelClass = "", overlayClass = "", closeButtonClass = "" }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`overlay${overlayClass ? " " + overlayClass : ""}`}>
      <div className="overlay-background" onClick={onClose}></div>
      <div className={`overlay-panel bodyFont${panelClass ? " " + panelClass : ""}`}>
        {!disableClose && <FontAwesomeIcon icon={faCircleXmark} className={`overlay-close no-select-pointer${closeButtonClass ? " " + closeButtonClass : ""}`} onClick={onClose}/>}
        {children}
      </div>
    </div>
  );
}