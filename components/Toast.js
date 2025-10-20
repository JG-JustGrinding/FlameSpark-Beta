import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message = '', isOpen = false, onClose = () => {} }) {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), 1800);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <div className={`toast ${isOpen ? 'open' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
