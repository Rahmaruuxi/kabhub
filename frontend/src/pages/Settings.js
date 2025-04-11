import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  KeyIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, uploadProfilePicture } =
    useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    field: user?.field || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: true,
      answerNotifications: true,
      upvoteNotifications: true,
      mentionNotifications: true,
    },
    privacySettings: {
      showEmail: false,
      showUniversity: true,
      showCourse: true,
      showYear: true,
    },
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using OpenStreetMap Nominatim API to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.display_name) {
            setFormData((prev) => ({
              ...prev,
              location: data.display_name,
            }));
            setSuccess("Location updated successfully");
          } else {
            setError("Could not determine location name");
          }
        } catch (err) {
          setError("Failed to get location name");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setError("Error getting location: " + error.message);
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: "/settings" } });
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || "",
          field: userData.field || "",
          notificationPreferences:
            userData.notificationPreferences || prev.notificationPreferences,
          privacySettings: userData.privacySettings || prev.privacySettings,
        }));
        setPreviewUrl(userData.profilePicture);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login", { state: { from: "/settings" } });
        }
      }
    };

    fetchUserData();
  }, [token, navigate, logout]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const [category, setting] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, or GIF)");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        await uploadProfilePicture(file);
        setSuccess("Profile picture updated successfully");
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to upload profile picture"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        field: formData.field,
      });
      setSuccess("Profile updated successfully");
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { state: { from: "/settings" } });
      }
      // Only show errors for actual update failures
      setError("Failed to update profile. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/me/password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Password updated successfully");
        // Clear password fields after successful update
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Current password is incorrect");
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || "Invalid password format");
      } else {
        setError("Unable to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        "http://localhost:5000/api/users/notification-preferences",
        formData.notificationPreferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Notification preferences updated successfully");
    } catch (err) {
      setError("Failed to update notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        "http://localhost:5000/api/users/privacy-settings",
        formData.privacySettings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Privacy settings updated successfully");
    } catch (err) {
      setError("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.delete("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      logout();
      navigate("/");
    } catch (err) {
      setError("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tabs */}
          <div className="w-full sm:w-48 flex sm:flex-col overflow-x-auto sm:overflow-visible">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "profile"
                  ? "bg-[#136269] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "account"
                  ? "bg-[#136269] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <KeyIcon className="h-5 w-5 mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "notifications"
                  ? "bg-[#136269] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "privacy"
                  ? "bg-[#136269] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Privacy
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6 transition-opacity duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6 transition-opacity duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative group">
                      <div className="relative transition-transform duration-200 group-hover:scale-105">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt=""
                            className="h-24 w-24 rounded-full object-cover border-4 border-[#5DB2B3] shadow-md group-hover:border-[#136269] transition-colors duration-200"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-[#136269] flex items-center justify-center border-4 border-[#5DB2B3] shadow-md group-hover:border-[#136269] transition-colors duration-200">
                            <span className="text-3xl font-semibold text-white">
                              {formData.name
                                ? formData.name.charAt(0).toUpperCase()
                                : ""}
                            </span>
                          </div>
                        )}
                        <label
                          htmlFor="profile-picture"
                          className="absolute bottom-0 right-0 bg-[#136269] rounded-full p-2 cursor-pointer hover:bg-[#0f4a52] transition-all duration-200 shadow-lg hover:scale-110"
                        >
                          <PhotoIcon className="h-4 w-4 text-white" />
                          <input
                            type="file"
                            id="profile-picture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                          />
                        </label>
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-2">
                        Click to change photo
                      </div>
                    </div>
                    <div className="flex-1">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50"
                      >
                        {locationLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-5 w-5 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Get Current Location
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="field"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Field of Study
                    </label>
                    <input
                      type="text"
                      id="field"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50"
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Account
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5 mr-1" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificationPreferences.emailNotifications"
                        checked={
                          formData.notificationPreferences.emailNotifications
                        }
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive notifications in browser
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificationPreferences.pushNotifications"
                        checked={
                          formData.notificationPreferences.pushNotifications
                        }
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Answer Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone answers your question
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificationPreferences.answerNotifications"
                        checked={
                          formData.notificationPreferences.answerNotifications
                        }
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Upvote Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone upvotes your content
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificationPreferences.upvoteNotifications"
                        checked={
                          formData.notificationPreferences.upvoteNotifications
                        }
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Mention Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone mentions you
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="notificationPreferences.mentionNotifications"
                        checked={
                          formData.notificationPreferences.mentionNotifications
                        }
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Privacy Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show Email
                      </label>
                      <p className="text-sm text-gray-500">
                        Make your email visible to other users
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacySettings.showEmail"
                        checked={formData.privacySettings.showEmail}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show University
                      </label>
                      <p className="text-sm text-gray-500">
                        Display your university on your profile
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacySettings.showUniversity"
                        checked={formData.privacySettings.showUniversity}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show Course
                      </label>
                      <p className="text-sm text-gray-500">
                        Display your course on your profile
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacySettings.showCourse"
                        checked={formData.privacySettings.showCourse}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show Year
                      </label>
                      <p className="text-sm text-gray-500">
                        Display your year of study on your profile
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacySettings.showYear"
                        checked={formData.privacySettings.showYear}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#136269] focus:ring-[#5DB2B3] border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handlePrivacyUpdate}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDelete}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
