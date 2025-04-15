import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  TagIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const [opportunity, setOpportunity] = useState(
    location.state?.opportunity || null
  );
  const [loading, setLoading] = useState(!location.state?.opportunity);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: `/opportunity/${id}` } });
      return;
    }

    if (!location.state?.opportunity) {
      fetchOpportunity();
    }
  }, [id, token, navigate, location.state]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/opportunities/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpportunity(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch opportunity details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/opportunities/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === "Opportunity deleted successfully") {
        navigate("/opportunities");
      } else {
        throw new Error("Failed to delete opportunity");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete opportunity");
      // Show error for 3 seconds then clear it
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "job":
        return <BriefcaseIcon className="h-6 w-6 text-[#136269]" />;
      case "internship":
        return <AcademicCapIcon className="h-6 w-6 text-[#136269]" />;
      case "scholarship":
        return <UserGroupIcon className="h-6 w-6 text-[#136269]" />;
      default:
        return <BriefcaseIcon className="h-6 w-6 text-[#136269]" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/opportunities")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Opportunities
          </button>
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/opportunities")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Opportunities
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/opportunities")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Opportunities
          </button>
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="text-center text-gray-500">
              Opportunity not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate("/opportunities")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Opportunities
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#5DB2B3]">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#136269] to-[#5DB2B3] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {opportunity.title}
            </h1>
          </div>

          <div className="p-6 space-y-8">
            {/* Company and Basic Info */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-lg text-gray-700">
                <BuildingOfficeIcon className="h-6 w-6 text-[#136269]" />
                <span className="font-medium">{opportunity.company}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="h-5 w-5 text-[#136269]" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarIcon className="h-5 w-5 text-[#136269]" />
                  <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>
                {opportunity.salary && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CurrencyDollarIcon className="h-5 w-5 text-[#136269]" />
                    <span>{opportunity.salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#136269]/10 text-[#136269]"
                  >
                    <TagIcon className="h-4 w-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description Section */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-[#136269] mb-4">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {opportunity.description}
              </p>

              {opportunity.requirements && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-[#136269] mb-4">
                    Requirements
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {opportunity.requirements}
                  </p>
                </div>
              )}

              {opportunity.benefits && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-[#136269] mb-4">
                    Benefits
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {opportunity.benefits}
                  </p>
                </div>
              )}
            </div>

            {/* How to Apply Section */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-[#136269] mb-6">
                How to Apply
              </h2>
              <div className="space-y-4">
                {opportunity.applyUrl && (
                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#136269] hover:bg-[#0f4a52] transition-all duration-200 shadow-sm"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Apply Now
                  </a>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {opportunity.contactEmail && (
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 mr-2 text-[#136269]" />
                      <a
                        href={`mailto:${opportunity.contactEmail}`}
                        className="hover:text-[#136269] transition-colors"
                      >
                        {opportunity.contactEmail}
                      </a>
                    </div>
                  )}

                  {opportunity.contactPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2 text-[#136269]" />
                      <a
                        href={`tel:${opportunity.contactPhone}`}
                        className="hover:text-[#136269] transition-colors"
                      >
                        {opportunity.contactPhone}
                      </a>
                    </div>
                  )}

                  {opportunity.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <GlobeAltIcon className="h-5 w-5 mr-2 text-[#136269]" />
                      <a
                        href={opportunity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#136269] transition-colors"
                      >
                        {opportunity.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit/Delete Buttons */}
            {user && opportunity.author && (user.id === opportunity.author._id || user.id === opportunity.author) && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/edit-opportunity/${id}`)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#136269] bg-[#136269]/10 rounded-lg hover:bg-[#136269]/20 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Opportunity
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
