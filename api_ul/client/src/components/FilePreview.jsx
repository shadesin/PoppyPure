// src/components/FilePreview.jsx
import React from "react";

const FilePreview = ({ file }) => {
  const getFileIcon = () => {
    const extension = file.name.split(".").pop().toLowerCase();
    const fileType = file.type.split("/")[0];

    if (fileType === "image") {
      return (
        <div className="file-preview-image">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            onLoad={() => URL.revokeObjectURL(file)}
          />
        </div>
      );
    }

    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📑",
      pptx: "📑",
      txt: "📋",
      zip: "🗜️",
      rar: "🗜️",
      mp3: "🎵",
      mp4: "🎬",
    };

    return <div className="file-preview-icon">{icons[extension] || "📁"}</div>;
  };

  return getFileIcon();
};

export default FilePreview;
