import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const EditMentorship = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    schedule: "",
    requirements: [""],
    goals: [""],
    location: "",
    contactEmail: "",
    contactPhone: "",
    communityLink: "",
  });

  useEffect(() => {
    const fetchMentorship = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/mentorships/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const mentorship = response.data;

        setFormData({
          title: mentorship.title || "",
          description: mentorship.description || "",
          category: mentorship.category || "",
          duration: mentorship.duration || "",
          schedule: mentorship.schedule || "",
          requirements: mentorship.requirements?.length
            ? mentorship.requirements
            : [""],
          goals: mentorship.goals?.length ? mentorship.goals : [""],
          location: mentorship.location || "",
          contactEmail: mentorship.contactEmail || "",
          contactPhone: mentorship.contactPhone || "",
          communityLink: mentorship.communityLink || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch mentorship");
        setLoading(false);
      }
    };

    fetchMentorship();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const filteredFormData = {
        ...formData,
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        goals: formData.goals.filter((goal) => goal.trim() !== ""),
      };

      await axios.put(
        `http://localhost:5000/api/mentorships/${id}`,
        filteredFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/mentorship/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update mentorship");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Mentorship
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                placeholder="e.g., Web Development Mentorship"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                placeholder="Describe what you'll teach and what mentees can expect..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  placeholder="City or 'Remote'"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Duration (months) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  max="12"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="schedule"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Schedule *
                </label>
                <input
                  type="text"
                  id="schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  placeholder="e.g., 2 hours per week"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) =>
                      handleArrayChange(e, index, "requirements")
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                    placeholder="e.g., Basic programming knowledge"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, "requirements")}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("requirements")}
                className="mt-2 text-sm text-[#136269] hover:text-[#0f4a52]"
              >
                + Add Requirement
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals
              </label>
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleArrayChange(e, index, "goals")}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                    placeholder="e.g., Build a full-stack web application"
                  />
                  {formData.goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, "goals")}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("goals")}
                className="mt-2 text-sm text-[#136269] hover:text-[#0f4a52]"
              >
                + Add Goal
              </button>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5DB2B3] focus:ring-[#5DB2B3] sm:text-sm"
                    placeholder="Enter contact email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5DB2B3] focus:ring-[#5DB2B3] sm:text-sm"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="communityLink"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Community Link (Discord, WhatsApp, etc.)
                </label>
                <input
                  type="url"
                  id="communityLink"
                  name="communityLink"
                  value={formData.communityLink}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5DB2B3] focus:ring-[#5DB2B3] sm:text-sm"
                  placeholder="Enter community link"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/mentorship/${id}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#136269] border border-transparent rounded-md shadow-sm hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3]"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMentorship;
