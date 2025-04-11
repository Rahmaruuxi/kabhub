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
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/opportunities")}
          className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Opportunities
        </button>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#5DB2B3]">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {getTypeIcon(opportunity.type)}
                  <h1 className="text-2xl font-bold text-gray-900">
                    {opportunity.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-1" />
                    {opportunity.company}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-1" />
                    {new Date(opportunity.deadline).toLocaleDateString()}
                  </div>
                  {opportunity.salary && (
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                      {opportunity.salary}
                    </div>
                  )}
                </div>

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {opportunity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#136269]/10 text-[#136269]"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {user &&
                opportunity.author &&
                user._id === opportunity.author._id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/edit-opportunity/${id}`)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#136269] bg-[#136269]/10 rounded-lg hover:bg-[#136269]/20 transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                )}
            </div>

            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {opportunity.description}
              </p>

              {opportunity.requirements && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                    Requirements
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {opportunity.requirements}
                  </p>
                </>
              )}

              {opportunity.benefits && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                    Benefits
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {opportunity.benefits}
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                How to Apply
              </h2>
              <div className="space-y-4">
                {opportunity.applyUrl && (
                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#136269] hover:bg-[#0f4a52]"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Apply Now
                  </a>
                )}

                {opportunity.contactEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <a
                      href={`mailto:${opportunity.contactEmail}`}
                      className="hover:text-[#136269]"
                    >
                      {opportunity.contactEmail}
                    </a>
                  </div>
                )}

                {opportunity.contactPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <a
                      href={`tel:${opportunity.contactPhone}`}
                      className="hover:text-[#136269]"
                    >
                      {opportunity.contactPhone}
                    </a>
                  </div>
                )}

                {opportunity.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    <a
                      href={opportunity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#136269]"
                    >
                      {opportunity.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
