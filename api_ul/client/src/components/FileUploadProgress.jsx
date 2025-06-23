// src/components/FileUploadProgress.jsx
import React from "react";

const FileUploadProgress = ({ progress }) => {
  return (
    <div
      className="upload-progress"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      <span className="progress-text">{Math.round(progress)}%</span>
    </div>
  );
};

export default FileUploadProgress;
