import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserCircleIcon,
  PencilIcon,
  PhotoIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  EyeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profileData = {
        ...response.data,
        questionsAsked: response.data.questionsAsked || [],
        answersGiven: response.data.answersGiven || [],
      };
      setProfile(profileData);
      setEditedProfile(profileData);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch profile data");
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // First update profile picture if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("profilePicture", selectedImage);

        await axios.post(
          "http://localhost:5000/api/users/profile/picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Then update other profile data
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        editedProfile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data.user);
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#136269]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-[#136269]">Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center text-[#136269] hover:text-[#0f4a52]"
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div className="flex items-start space-x-6 mb-6">
            <div className="relative">
              {profile.profilePicture ? (
                <img
                  src={`http://localhost:5000${profile.profilePicture}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#5DB2B3]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              ) : (
                <UserCircleIcon className="w-32 h-32 text-[#5DB2B3]" />
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-[#136269] text-white p-2 rounded-full cursor-pointer hover:bg-[#0f4a52] transition-colors">
                  <PhotoIcon className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {imagePreview && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  University
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.university || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        university: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {profile.university || "Not specified"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.course || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          course: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.course || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={editedProfile.year || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          year: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {profile.year || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        bio: e.target.value,
                      })
                    }
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {profile.bio || "No bio yet"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#136269] text-white rounded-md hover:bg-[#0f4a52]"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-[#136269] mb-4">
            Activity
          </h2>
          <div className="flex gap-32">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-3 text-[#5DB2B3]" />
                <span className="text-2xl font-bold text-[#136269]">
                  {profile?.questionsAsked?.length || 0}
                </span>
              </div>
              <span className="text-sm text-gray-600 mt-1">
                Questions Asked
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-[#136269] mr-3">
                  {profile?.answersGiven?.length || 0}
                </span>
                <ChatBubbleLeftIcon className="h-5 w-5 text-[#5DB2B3]" />
              </div>
              <span className="text-sm text-gray-600 mt-1">Answers Given</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
