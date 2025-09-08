'use client';

import React, { useState, useEffect } from 'react';
import "./CappedInput.css"

const CappedInput = ({
  label,
  value,
  onChange,
  placeholder = 'Enter text here...',
  maxLength = 100,
  isTextArea = false,
  className = '',
  id,
}) => {
  return (
    <div className={`field capped-input ${className}`}>
      {label && <label htmlFor={id} className="bodyFont">{label}</label>}

      {isTextArea ? (
        <textarea
          id={id}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bodyFont input-field"
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

      <span className={`counter bodyFont label-color`}>
        {value.length}/{maxLength}
      </span>
    </div>
  );
};

export default CappedInput;
