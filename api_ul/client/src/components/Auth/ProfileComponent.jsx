// src/components/ProfileComponent.jsx
import React, { useState } from "react";

const ProfileComponent = ({
  currentUser,
  uploadedImages,
  onDeleteImage,
  onDeleteAccount,
  isOpen,
  onToggleProfile,
}) => {
  const [error, setError] = useState(null);

  // SVG for user logo
  //   const userLogoSvg = (
  //     <svg
  //       width="36"
  //       height="36"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
  //       <circle cx="12" cy="7" r="4"></circle>
  //     </svg>
  //   );

  // SVG for close tab icon
  const closeSvg = (
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
  );

  // SVG for delete image icon
  const deleteSvg = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  //delete images from profile
  //   const handleDeleteImage = async (fileId) => {
  //     try {
  //       await onDeleteImage(fileId);
  //       setError(null);
  //     } catch (err) {
  //       setError(err.message || "Failed to delete file");
  //     }
  //   };

  //newly added for alert window
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      onDeleteAccount().catch((err) => {
        setError(err.message || "Failed to delete account");
      });
    }
  };

  return (
    // Conditionally render the profile tab and apply the 'is-open' class
    <div className={`profile-tab ${isOpen ? "is-open" : ""}`}>
      {currentUser && (
        <>
          <button
            className="close-tab-btn"
            onClick={onToggleProfile}
            aria-label="Close Profile Tab"
          >
            {closeSvg}
          </button>
          <h3>User Profile</h3>
          {error && <div className="error-message">{error}</div>}
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {currentUser.fullName || "Anonymous User"}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email || "N/A"}
            </p>
          </div>
          {uploadedImages.length > 0 && (
            <div className="uploaded-images-history">
              <h4>Uploaded Files</h4>
              <ul className="image-history-list">
                {uploadedImages.map((image) => (
                  <li key={image._id} className="image-history-item">
                    <div className="image-preview-thumbnail">
                      {image.base64 && (
                        <img src={image.base64} alt={image.originalname} />
                      )}
                    </div>
                    <span className="image-name">{image.originalname}</span>
                    <button
                      onClick={() => onDeleteImage(image._id)}
                      className="delete-image-btn"
                      title="Delete Image"
                    >
                      {deleteSvg}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="profile-actions">
            <button
              className="delete-account-button"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileComponent;
