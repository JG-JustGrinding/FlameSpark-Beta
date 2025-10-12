'use client';

import React, { useState, useEffect } from 'react';
import "./CappedInput.css"

const CappedInput = ({
  children,
  label,
  value,
  onChange,
  placeholder = 'Enter text here...',
  maxLength = 100,
  isTextArea = false,
  hideCounter = false,
  className = '',
  noMinHeight = false,
  id,
}) => {
  return (
    <div className={`field capped-input ${className}`}>
      {label && <label htmlFor={id} className="bodyFont">{label}</label>}

    <div className='wrapper'>
      {isTextArea ? (
        <textarea
          id={id}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`bodyFont input-field${noMinHeight ? " no-min-height" : ""}`}
        />
      ) : (
        <input
          id={id}
          type="text"
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bodyFont input-field"
        />
      )}
      {children}
      </div>

      <span className={`counter bodyFont label-color ${hideCounter ? "hide" : ""}`}>
        {value.length}/{maxLength}
      </span>
    </div>
  );
};

export default CappedInput;
