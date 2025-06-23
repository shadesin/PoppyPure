import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";

const Register = ({ onRegister }) => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match on frontend
    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Create new object excluding confirmPassword
    const { fullName, email, password } = userData;
    const dataToSend = { fullName, email, password };

    try {
      const user = await register(dataToSend); // Send only required fields
      onRegister(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <span className="input-icon user-icon"></span>
          <input
            type="text"
            name="fullName"
            value={userData.fullName}
            onChange={handleChange}
            placeholder="Type your name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <span className="input-icon email-icon"></span>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="Type your email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <span className="input-icon lock-icon"></span>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            placeholder="Create your password"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <span className="input-icon lock-icon"></span>
          <input
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" className="auth-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
