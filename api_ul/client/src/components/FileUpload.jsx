// src/components/FileUpload.jsx
import axios from "axios";
import React, { useCallback, useState, useEffect, useRef } from "react";
import FileUploadProgress from "./FileUploadProgress";

const FileUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [adulterationLevel, setAdulterationLevel] = useState(null); // New state for adulteration level
  const [error, setError] = useState(null); // Added for error display
  const audioRef = useRef(null);

  //AUDIO HOOKS

  const adulterationSoundMap = {
    0: "/sounds/adulteration_0.mp3",
    10: "/sounds/adulteration_10.mp3",
    20: "/sounds/adulteration_20.m4a",
    30: "/sounds/adulteration_30.mp3",
    40: "/sounds/adulteration_40.mp3",
    50: "/sounds/adulteration_50.mp3",
    100: "/sounds/adulteration_100.mp3",
    default: "/sounds/default.mp3", // Fallback sound
  };

  useEffect(() => {
    console.log("Adulteration level changed:", adulterationLevel);
    if (adulterationLevel !== null && typeof adulterationLevel === "number") {
      const soundPath = adulterationSoundMap[adulterationLevel] || adulterationSoundMap.default;

      if (soundPath) {
        const audio = new Audio(soundPath); // Create a new Audio object
        audio.play().catch((playError) => {
          console.warn(
            `Could not play sound for level ${adulterationLevel}:`,
            playError
          );
        });
      } else {
        console.warn(
          `No sound defined for adulteration level: ${adulterationLevel}`
        );
      }
    }
  }, [adulterationLevel]);



  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      console.log("Drop event triggered");

      // If a file is already selected or adulteration level is displayed, do not allow new drops
      if (selectedFiles.length > 0 || adulterationLevel !== null) {
        console.log(
          "Please remove the current file before uploading a new one."
        );
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [selectedFiles, adulterationLevel] //add adulterationlevel to dependency array
  );

  const handleChange = (e) => {
    // If a file is already selected or adulteration level is displayed, do not allow new selections
    if (selectedFiles.length > 0 || adulterationLevel !== null) {
      console.log("Please remove the current file before uploading a new one.");
      e.target.value = null; // Clear the input so the same file can be selected again after removal
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    //define allowed filetypes
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    const validFiles = Array.from(files).filter(
      (file) =>
        file.size <= 10 * 1024 * 1024 && // 10MB limit
        allowedTypes.includes(file.type) // Check if file type is allowed
    );

    // If a valid file is found, set it as the only selected file
    if (validFiles.length > 0) {
      setSelectedFiles([validFiles[0]]); // Set only the first valid file
      // No need to setDragActive(false) explicitly here, as the conditional rendering
      // of upload-area depends on selectedFiles.length.
      setError(null);
      console.log("Selected file:", validFiles[0].name);
    } else {
      setError("Invalid file type or size. Only JPG/PNG up to 10MB allowed.");
      console.log("Invalid file selected");
    }
    // setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    console.log("Removing file");
    setSelectedFiles([]); //setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress({}); // Clear progress when file is removed
    setIsUploading(false); // Reset uploading state
    setAdulterationLevel(null); // Reset adulteration level
    setError(null);
    // When the file is removed, the drag and drop area will reappear due to conditional rendering
  };


  
  //newly added axios
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      console.log("No files to upload");
      return;
    }
    setIsUploading(true);
    setError(null);
    console.log("Starting upload for file:", selectedFiles[0].name);

    const file = selectedFiles[0]; // Take the first file
    const formData = new FormData();
    formData.append("file", file); // Single file with key "file"

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${
              localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")).token
                : ""
            }`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress({ 0: progress }); // setUploadProgress((prev) => ({ ...prev, [0]: progress }));
            console.log("Upload progress:", progress);
          },
        }
      );

      console.log("Upload response:", response.data);

      const uploadedFile = response.data.file;
      onUpload([uploadedFile]);
      try {
        const predictionRes = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/predict/${uploadedFile._id}`,
          {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).token
                  : ""
              }`,
            },
          }
        );

        const { predictedClass } = predictionRes.data.result;

        const classMap = {
          0: 0,
          1: 10,
          2: 20,
          3: 30,
          4: 40,
          5: 50,
          6: 100,
        };

        const mappedClass = classMap[predictedClass] ?? "Unknown";
        setAdulterationLevel(mappedClass);
      } catch (predictionError) {
        console.error("Prediction error:", predictionError);
        setError("Prediction failed. Please try again.");
      }
      setIsUploading(false);
      // setSelectedFiles([]);
      // setUploadProgress({});
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      alert(
        `Failed to upload file: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // const simulateUpload = () => {
  //   if (selectedFiles.length === 0) return;

  //   setIsUploading(true);
  //   const newProgress = {};

  //   selectedFiles.forEach((file, index) => {
  //     newProgress[index] = 0;
  //     // Simulate upload progress
  //     const interval = setInterval(() => {
  //       setUploadProgress((prev) => {
  //         const newValue = prev[index] + Math.random() * 10;
  //         if (newValue >= 100) {
  //           clearInterval(interval);
  //           return { ...prev, [index]: 100 };
  //         }
  //         return { ...prev, [index]: newValue };
  //       });
  //     }, 200);
  //   });

  //   // Simulate completion after 3 seconds
  //   setTimeout(() => {
  //     onUpload(selectedFiles);
  //     setSelectedFiles([]);
  //     setUploadProgress({});
  //     setIsUploading(false);
  //   }, 3000);
  // };

  return (
    <div
      className={`file-upload-container ${
        dragActive && setSelectedFiles.length === 0 ? "drag-active" : ""
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {error && <div className="error-message">{error}</div>}

      {selectedFiles.length === 0 && (
        <div className="upload-area">
          <input
            type="file"
            id="file-upload"
            onChange={handleChange}
            className="file-input"
            accept="image/jpeg,image/png,image/jpg"
          />
          <label htmlFor="file-upload" className="upload-label">
            <div className="upload-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3>Drag & Drop files here</h3>
            <p>or click to browse</p>
            <p className="file-types">Supports: JPEG, JPG, PNG,(Max 10MB)</p>
          </label>
          {/* <Lottie
            animationData={uploadAnimation}
            loop={true}
            style={{ width: 100, height: 100, marginBottom: "1rem" }}
          /> */}
        </div>
      )}
      {selectedFiles.length > 0 && adulterationLevel === null && (
        <div className="selected-files">
          <h4>Selected File</h4>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item-display">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="uploaded-image-large"
                  onError={() => setError("Failed to load image preview")}
                />
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {uploadProgress[index] !== undefined &&
                  uploadProgress[index] < 100 ? (
                    <FileUploadProgress progress={uploadProgress[index]} />
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="remove-file-icon"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={uploadFiles}
            disabled={isUploading || selectedFiles.length === 0}
            className="upload-button"
          >
            {isUploading ? "Calculating..." : "Upload File"}
          </button>
        </div>
      )}

      {selectedFiles.length > 0 && adulterationLevel !== null && (
        <div className="adulteration-display-container">
          <h4>Adulteration Level</h4>
          <div className="adulteration-bar-wrapper">
            <div
              className="adulteration-bar"
              style={{ width: `${adulterationLevel}%` }}
            ></div>
            <span className="adulteration-percentage-text">
              {adulterationLevel}%
            </span>
          </div>
          <div className="file-item-display">
            <img
              src={URL.createObjectURL(selectedFiles[0])}
              alt={selectedFiles[0].name}
              className="uploaded-image-large"
              onError={() => setError("Failed to load image preview")}
            />
            <div className="file-info">
              <span className="file-name">{selectedFiles[0].name}</span>
              <span className="file-size">
                {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button onClick={() => removeFile()} className="remove-file-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
