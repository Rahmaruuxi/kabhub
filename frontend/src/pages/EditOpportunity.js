import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const EditOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    company: "",
    location: "",
    requirements: [""],
    benefits: [""],
    deadline: "",
    salary: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
  });

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/opportunities/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const opportunity = response.data;

        // Format the date to YYYY-MM-DD for the input
        const formattedDate = new Date(opportunity.deadline)
          .toISOString()
          .split("T")[0];

        setFormData({
          title: opportunity.title || "",
          description: opportunity.description || "",
          type: opportunity.type || "",
          company: opportunity.company || "",
          location: opportunity.location || "",
          requirements: opportunity.requirements?.length
            ? opportunity.requirements
            : [""],
          benefits: opportunity.benefits?.length ? opportunity.benefits : [""],
          deadline: formattedDate || "",
          salary: opportunity.salary || "",
          contactEmail: opportunity.contactEmail || "",
          contactPhone: opportunity.contactPhone || "",
          website: opportunity.website || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch opportunity");
        setLoading(false);
      }
    };

    fetchOpportunity();
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
      // Filter out empty requirements and benefits
      const filteredFormData = {
        ...formData,
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        benefits: formData.benefits.filter((benefit) => benefit.trim() !== ""),
      };

      await axios.put(
        `http://localhost:5000/api/opportunities/${id}`,
        filteredFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/opportunity/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update opportunity");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 my-8 mx-4">
        <h1 className="text-3xl font-bold text-[#136269] mb-10 text-center">
          Edit Opportunity
        </h1>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            >
              <option value="">Select Type</option>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
              <option value="scholarship">Scholarship</option>
              <option value="volunteer">Volunteer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700"
            >
              Company/Organization
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                placeholder="City, Country"
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
                  onChange={(e) => handleArrayChange(e, index, "requirements")}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                  placeholder="Enter requirement"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, "requirements")}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("requirements")}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Add Requirement
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits
            </label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayChange(e, index, "benefits")}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                  placeholder="Enter benefit"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, "benefits")}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("benefits")}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Add Benefit
            </button>
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700"
            >
              Salary/Stipend (Optional)
            </label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $50,000/year or $25/hour"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Phone (Optional)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-gray-700"
            >
              Website (Optional)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GlobeAltIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm hover:border-[#136269] transition-colors"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/opportunity/${id}`)}
              className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#136269] hover:bg-[#0f4a52] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOpportunity;
