import axios from "axios";

const API_URL = `${import.meta.env.VITE_APP_API_URL}/api/auth`;
const FILES_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/files`;

// Set up axios defaults
axios.defaults.headers.post["Content-Type"] = "application/json";

//axios for login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const data = response.data;
    localStorage.setItem("user", JSON.stringify(data)); //Stores the data (user information) in the browser's localStorage
    //JSON.stringify(data) converts the JavaScript object into a JSON string, as localStorage can only store strings.
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed"); //error.response?.data?.message attempts to extract a more specific error message from the API response if available (e.g., "Invalid credentials").
  }
};

//axios for register
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    const data = response.data;
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

//axios for fetching current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsedUser = JSON.parse(user);
    if (!parsedUser?.token) {
      console.warn("Invalid user data in localStorage, clearing");
      localStorage.removeItem("user");
      return null;
    }
    return parsedUser;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

//delete account feature axios
export const deleteAccount = async () => {
  try {
    const user = getCurrentUser();
    if (!user?.token) {
      throw new Error("No user token found");
    }
    await axios.delete(`${API_URL}/delete`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    localStorage.removeItem("user");
    return true;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete account"
    );
  }
};

//fetch files in profile axios
export const fetchUserFiles = async () => {
  try {
    const user = getCurrentUser();
    if (!user?.token) {
      throw new Error("No user token found");
    }
    const response = await axios.get(FILES_API_URL, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch files");
  }
};

// Optional: Add request interceptor to include auth token if available
axios.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//this interceptor automates the process of attaching the JWT (JSON Web Token) to every outgoing Axios request. 
// This is a fundamental pattern for authenticated API calls in single-page applications. 
// Instead of manually adding the Authorization header to each request, the interceptor does it automatically,
// ensuring that all authenticated requests include the necessary token for your backend to verify the user's identity.
