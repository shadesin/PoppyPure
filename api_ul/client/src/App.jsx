import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import FileUpload from "./components/FileUpload";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Auth/Navbar";
import ProfileComponent from "./components/Auth/ProfileComponent";
import {
  getCurrentUser,
  fetchUserFiles,
  deleteAccount,
} from "./services/authService";
import { ThemeContext } from "./ThemeContext";

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null); // Added for error display
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate(); // Added for programmatic navigation

  //light-mode/dark-mode
  const { theme } = useContext(ThemeContext);

  //function for fetching files
  const fetchFiles = async () => {
    try {
      const response = await fetchUserFiles();
      setFiles(response);
      console.log("Fetched files:", response);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files");
    }
  };

  //this useEffect block acts as an initial authentication gate: it checks if a user is already logged in
  useEffect(() => {
    console.log("Checking for current user");
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      console.log("User found:", currentUser);
      fetchFiles();
    } else {
      console.log("No user found");
      navigate("/login"); // Redirect to login if no user
    }
  }, []);

  //Authentication handlers
  const handleLogin = (userData) => {
    console.log("User logged in:", userData);
    setUser(userData);
    setError(null);
    fetchFiles();
    navigate("/"); // Redirect to home after login
  };

  const handleRegister = (userData) => {
    console.log("User registered:", userData);
    setUser(userData);
    setError(null);
    fetchFiles();
    navigate("/"); // Redirect to home after registration
  };

  // Handle tab closure vs reload ***************(NOT YET WORKING)
  useEffect(() => {
    // Generate a unique tab ID and store in sessionStorage
    const tabId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("tabId", tabId);
    sessionStorage.setItem("isActive", "true");

    const handleBeforeUnload = () => {
      const isActive = sessionStorage.getItem("isActive");
      const user = getCurrentUser();
      console.log("BeforeUnload: isActive=", isActive, "user=", user);

      if (user?.token && !isActive) {
        console.log("Triggering logout on tab close");
        navigator.sendBeacon(
          "https://final-year-project-p013.onrender.com/api/auth/logout",
          new Blob([], { type: "application/json" })
        );
        localStorage.removeItem("user");
        sessionStorage.clear(); // Ensure sessionStorage is cleared
      }
    };

    // On page load, check if this is a new tab or reload
    const handleLoad = () => {
      const storedTabId = sessionStorage.getItem("tabId");
      if (storedTabId === tabId) {
        console.log(
          "Page loaded: This is a reload or new tab with same session"
        );
        sessionStorage.setItem("isActive", "true");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);



  //NEW LOGOUT FUNCTION
  const handleLogout = async () => {
    console.log("Attempting logout");
    try {
      const user = getCurrentUser();
      if (!user?.token) {
        console.warn("No user token found, clearing localStorage");
        localStorage.removeItem("user");
        setUser(null);
        setFiles([]);
        setError(null);
        navigate("/login");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      console.log("Logout successful");
      localStorage.removeItem("user");
      setUser(null);
      setFiles([]);
      setError(null);
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error(
        "Logout error:",
        error.response?.data?.message || error.message
      );
      setError(
        "Failed to logout: " + (error.response?.data?.message || error.message)
      );
      // Proceed with client-side logout even if backend fails
      localStorage.removeItem("user");
      setUser(null);
      setFiles([]);
      navigate("/login");
    }
  };




  //The handleUpload function is designed to incrementally add newly selected files to a list of files managed by the component's state
  const handleUpload = (uploadedFiles) => {
    setFiles((prev) => [...prev, ...uploadedFiles]); 
    console.log("Files ready for upload:", uploadedFiles);
  };



  //handle to delete images from a specific user profile
  const handleDeleteImage = async (fileId) => {
    try {
      console.log("Attempting to delete file:", fileId); // Debug
      await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}/api/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      console.log("File deleted:", fileId);
      setError(null);
    } catch (error) {
      console.error(
        "Error deleting file:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || "Failed to delete file";
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw for ProfileComponent to catch
    }
  };



  //deleteaccount handler
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      console.log("Account deleted successfully");
      localStorage.removeItem("user");
      setUser(null);
      setFiles([]);
      setError(null);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account");
      throw error;
    }
  };

  const handleToggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  // const handleRemove = (index) => {
  //   const newFiles = [...files];
  //   newFiles.splice(index, 1);
  //   setFiles(newFiles);
  // };

  //this is the new handler for syncing the delete from the server
  // const handleRemove = async (fileId) => {
  //   try {
  //     await axios.delete(`https://final-year-project-p013.onrender.com/api/files/${fileId}`, {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     });
  //     setFiles(files.filter((file) => file._id !== fileId));
  //   } catch (error) {
  //     console.error("Error deleting file:", error);
  //   }
  // };

  //newly added hook
  // useEffect(() => {
  //   if (user) {
  //     const fetchFiles = async () => {
  //       try {
  //         const response = await axios.get("https://final-year-project-p013.onrender.com/api/files", {
  //           headers: {
  //             Authorization: `Bearer ${user.token}`,
  //           },
  //         });
  //         setFiles(response.data);
  //         console.log("Fetched files:", response.data);
  //       } catch (error) {
  //         console.error("Error fetching files:", error);
  //         setError("Failed to fetch files");
  //       }
  //     };
  //     fetchFiles();
  //   }
  // }, [user]);

  return (
    // <Router>
    <div className="app-container">
      {error && <div className="error-message">{error}</div>}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onToggleProfile={handleToggleProfile}
      />

      <main className="app-main">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Register onRegister={handleRegister} />
              )
            }
          />
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : (
                <div className="upload-section">
                  <FileUpload onUpload={handleUpload} />
                  <ProfileComponent
                    currentUser={user}
                    onLogout={handleLogout}
                    uploadedImages={files}
                    onDeleteImage={handleDeleteImage}
                    onDeleteAccount={handleDeleteAccount}
                    isOpen={isProfileOpen}
                    onToggleProfile={handleToggleProfile}
                  />
                </div>
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
