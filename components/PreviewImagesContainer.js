'use client';

import React, { useState, useEffect, useRef } from 'react';
import "./PreviewImagesContainer.css";

const PreviewImagesContainer = ({
  label = "Preview Images (Up to MAX_PREVIEW_IMAGES)",
  previewImages,
  setPreviewImages,
  previewUpload,
  setPreviewUpload,
  MAX_PREVIEW_IMAGES = 5,
}) => {
  const fileInputRef = useRef(null);

  const handlePreviewChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      const combined = [...previewImages, ...newUrls].slice(0, MAX_PREVIEW_IMAGES);
      const combinedFiles = [...previewUpload, ...newFiles].slice(0, MAX_PREVIEW_IMAGES);

      setPreviewImages(combined);
      setPreviewUpload(combinedFiles);

      fileInputRef.current.value = '';
    }
  };

  const handleRemovePreviewImage = (index) => {
    URL.revokeObjectURL(previewImages[index]);

    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setPreviewUpload(previewUpload.filter((_, i) => i !== index));
  }
    
  return (
    <>
    {label &&<label className={`bodyFont`}>{label.replace("MAX_PREVIEW_IMAGES", MAX_PREVIEW_IMAGES)}</label>}
    {previewImages.length > 0 && <span className="label-color bodyFont">{previewImages.length} {previewImages.length != 1 ? "Images" : "Image"}</span>}
    <input type="file" accept="image/*" className="bodyFont input-field" multiple ref={fileInputRef} onChange={handlePreviewChange} />
    <div className="previewImages">
        {previewImages.map((img, i) => (
        <div key={i} className="previewImageContainer">
            <img src={img.url || img} alt={`Preview ${i}`} className={`previewImage sixteennine`} />
            <button className="bodyFont button-shape" onClick={() => handleRemovePreviewImage(i)}>Remove</button>
        </div>
        ))}
    </div>
    </>
  );
};

export default PreviewImagesContainer;