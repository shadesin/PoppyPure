import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Auth.css";
import { useState, useContext, useRef, useEffect } from "react";
import { ThemeContext } from "../../ThemeContext.jsx";

const Navbar = ({ user, onLogout, onToggleProfile }) => {

  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false); // New state for the features dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown container
  const mobileMenuRef = useRef(null); // Ref for the mobile menu links container
  const hamburgerButtonRef = useRef(null); // Ref for the hamburger icon button itself

  // Combined handleClickOutside for both features dropdown and mobile menu (KHUB KHANKI JINIS)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close features dropdown if clicked outside its area (navbar-left-section)
      // and not on the hamburger button (to prevent closing when opening mobile menu)
      if (
        dropdownRef.current && // Ensure the dropdown element exists
        !dropdownRef.current.contains(event.target) && // Click was outside the dropdown itself
        hamburgerButtonRef.current && // Ensure hamburger button exists
        !hamburgerButtonRef.current.contains(event.target) // Click was NOT on the hamburger button
      ) {
        setIsFeaturesDropdownOpen(false);
      }
      // Close mobile menu if clicked outside its area
      // and not on the hamburger button (to prevent closing the menu it just opened)
      // and not on the features dropdown button (to prevent closing when opening features dropdown)
      if (
        mobileMenuRef.current && // Ensure the mobile menu element exists
        !mobileMenuRef.current.contains(event.target) && // Click was outside the mobile menu itself
        hamburgerButtonRef.current && // Ensure hamburger button exists
        !hamburgerButtonRef.current.contains(event.target) && // Click was NOT on the hamburger button
        dropdownRef.current && // Ensure the features dropdown's containing element exists
        !dropdownRef.current.contains(event.target) // Click was NOT on the features dropdown button/area
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); //This line registers the handleClickOutside function to be called whenever a mousedown event (when a mouse button is pressed down) occurs
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // This is the cleanup function for useEffect
    };
  }, [isFeaturesDropdownOpen, isMobileMenuOpen]); 



  // Toggle dropdown visibility  (BOTH DROPDOWN AND HAMBURGER MERGED)
  const toggleFeaturesDropdown = () => {
    setIsFeaturesDropdownOpen((prev) => !prev);
    // When opening features dropdown, close mobile menu if it's open
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu visibility  (BOTH DROPDOWN AND HAMBURGER MERGED)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    // When opening mobile menu, close features dropdown if it's open
    if (isFeaturesDropdownOpen) setIsFeaturesDropdownOpen(false);
  };




  // SVG for profile icon
  const profileSvg = (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );




  return (
    <nav className="navbar">
      <div className="navbar-left-section" ref={dropdownRef}>
        {" "}
        {/* New container for brand and dropdown */}
        <Link to="/" className="navbar-brand">
          <img src="/assets/images/mainlogo.png" alt="Logo" />
          PoppyPure
        </Link>
        {/* NEW DROPDOWN TOGGLE BUTTON */}
        <button
          className="dropdown-toggle-button"
          onClick={toggleFeaturesDropdown}
          aria-expanded={isFeaturesDropdownOpen}
          aria-label="Toggle Features Dropdown"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`dropdown-arrow-icon ${
              isFeaturesDropdownOpen ? "open" : ""
            }`}
          >
            {" "}
            {/* Add class for rotation */}
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div
          className={`features-dropdown-menu ${
            isFeaturesDropdownOpen ? "open" : ""
          }`}
        >
          {" "}
          {/* Add 'open' class conditionally */}
          <Link
            to="/"
            className="dropdown-item"
            onClick={() => setIsFeaturesDropdownOpen(false)}
          >
            Current Feature (Using MLP)
          </Link>
          <div className="dropdown-item disabled">
            {" "}
            {/* Using div for non-link item */}
            Pro Feature using ResNet50 and MLP(in further development)
          </div>
        </div>
      </div>

      {/* Hamburger Menu Button - visible only on small screens */}
      <button
        className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        ref={hamburgerButtonRef}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-icon"></span>
        <span className="hamburger-icon"></span>
        <span className="hamburger-icon"></span>
      </button>
      <div
        className={`navbar-links ${isMobileMenuOpen ? "open" : ""}`}
        ref={mobileMenuRef}
      >
        {user ? (
          <div className="user-section">
            <span className="welcome-message">
              Welcome, {user.fullName || "User"}
            </span>
            <div
              className="theme-toggle-switch"
              onClick={toggleTheme}
              role="button"
              tabIndex={0}
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
            >
              <input type="checkbox" checked={theme === "dark"} readOnly />
              <span className="slider"></span>
            </div>
            <button
              className="profile-icon-button"
              onClick={onToggleProfile}
              aria-label="Toggle Profile"
            >
              {profileSvg}
            </button>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className={`auth-link ${
                location.pathname === "/login" ? "active" : "inactive"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`auth-link ${
                location.pathname === "/register" ? "active" : "inactive"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
