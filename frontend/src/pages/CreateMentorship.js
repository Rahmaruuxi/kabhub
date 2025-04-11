import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const CreateMentorship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "programming",
    duration: "",
    requirements: [""],
    schedule: "",
    contactEmail: "",
    contactPhone: "",
    communityLink: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: newRequirements,
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to create a mentorship");
      }

      if (formData.communityLink && !isValidUrl(formData.communityLink)) {
        setError("Please enter a valid URL starting with http:// or https://");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/mentorships",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/mentorship/${response.data._id}`);
    } catch (error) {
      console.error("Error creating mentorship:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create mentorship. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-100 bg-gradient-to-r from-[#136269] to-[#0d4a50] text-center">
            <h3 className="text-3xl font-bold text-white">
              Create Mentorship Opportunity
            </h3>
            <p className="mt-3 text-[#5DB2B3] text-lg">
              Share your expertise and help others grow in their career
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                    placeholder="e.g., Python Programming Mentor"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                  >
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                  placeholder="Describe what you can offer as a mentor..."
                />
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    id="duration"
                    required
                    min="1"
                    max="12"
                    value={formData.duration}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                    placeholder="e.g., 3"
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Schedule
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    id="schedule"
                    required
                    value={formData.schedule}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                    placeholder="e.g., 2 hours per week"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements
                </label>
                <div className="space-y-3">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) =>
                          handleRequirementChange(index, e.target.value)
                        }
                        className="shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                        placeholder="e.g., Basic programming knowledge"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition duration-150 ease-in-out"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Requirement
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Contact Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      required
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="pl-10 shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="contactPhone"
                      id="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="pl-10 shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="communityLink"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Community Link *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="communityLink"
                    id="communityLink"
                    required
                    value={formData.communityLink}
                    onChange={handleChange}
                    className="pl-10 shadow-sm focus:ring-2 focus:ring-[#136269] focus:border-[#136269] block w-full sm:text-sm border-gray-300 rounded-lg transition duration-150 ease-in-out"
                    placeholder="https://discord.gg/... or https://chat.whatsapp.com/..."
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Add your community link (Discord server, WhatsApp group, etc.)
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/mentorships")}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#136269] hover:bg-[#0d4a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Mentorship"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMentorship;
