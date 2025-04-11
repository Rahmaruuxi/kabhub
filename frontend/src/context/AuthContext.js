import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched user data:", response.data);
      setUser(response.data);
      setToken(token);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData) => {
    try {
      console.log("Login user data:", userData);
      // Store the token
      localStorage.setItem("token", token);

      // Store user data
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // Update the state
      setToken(token);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("Error during login:", err);
      setError("Failed to complete login process");
      // Clean up any partial data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed");
      throw error;
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        "http://localhost:5000/api/users/profile/picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || "Profile picture upload failed"
      );
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePicture,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
