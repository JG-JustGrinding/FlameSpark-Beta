'use client';

import React, { useState, useEffect } from 'react';
import "./ArrayInputField.css";

const ArrayInputField = ({
  label,
  array,
  setArray,
  maxArrayCount = 5,
  placeholder = 'Enter text here...',
  maxLength = 100,
  useAddButton = true,
  disabled = false,
  id,
}) => {
    const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (tagInput.endsWith(','))
    {
      handleAddTag();
    }

  }, [tagInput])

  const handleAddTag = () => {
    let tag = tagInput.replace(/,/g, "");

    tag = tag.trim().replace(/\s+/g, " ");

    if (tag.length <= 0)
    {
      setTagInput("");
      return;
    }

    if (tag && array.length < maxArrayCount) {
      setArray([...array, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    if (disabled) return;

    setArray(array.filter((_, i) => i !== index));
  };

  return (

    <div className="field">
        <label htmlFor={id} className="bodyFont">{label.replace("maxArrayCount", maxArrayCount)}</label>
        <div className="tagInputRow">
        <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder={placeholder}
            className="bodyFont input-field"
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            maxLength={maxLength}
            id={id}
            disabled={disabled}
        />
        {(useAddButton && !disabled) && 
        <button type="button" className="button-shape bodyFont" onClick={handleAddTag}>
            Add
        </button>}
        </div>
    <div className="tags">
        {array.map((item, i) => (
            <span key={i} className={`tag bodyFont`}>
            {item}
              {!disabled && <span
                  className={`removeTag bodyFont`}
                  onClick={() => handleRemoveTag(i)}
              >
                  ✕
              </span>}
            </span>
        ))}
        </div>
    </div>
  );
};

export default ArrayInputField;