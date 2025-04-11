import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  BriefcaseIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const MentorshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [mentorship, setMentorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: `/mentorship/${id}` } });
      return;
    }

    fetchMentorship();
  }, [id, token, navigate]);

  const fetchMentorship = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/mentorships/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMentorship(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch mentorship details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this mentorship?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/mentorships/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === "Mentorship deleted successfully") {
        navigate("/mentorships");
      } else {
        throw new Error("Failed to delete mentorship");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete mentorship");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/mentorships")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Mentorships
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
            onClick={() => navigate("/mentorships")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Mentorships
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/mentorships")}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Mentorships
          </button>
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="text-center text-gray-500">
              Mentorship not found
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
          onClick={() => navigate("/mentorships")}
          className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#136269] transition-all duration-200 shadow-sm"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Mentorships
        </button>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#136269] text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{mentorship.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm opacity-90">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span className="capitalize">{mentorship.category}</span>
                  </div>
                  {mentorship.schedule && (
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      {mentorship.schedule}
                    </div>
                  )}
                  {mentorship.duration && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {mentorship.duration} months
                    </div>
                  )}
                </div>
              </div>

              {user &&
                mentorship.mentor &&
                user._id === mentorship.mentor._id && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate(`/edit-mentorship/${id}`)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#5DB2B3] rounded-lg hover:bg-[#4a9798] transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Mentor Information */}
            {mentorship.mentor && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mentor
                </h2>
                <div className="flex items-center">
                  {mentorship.mentor.profilePicture ? (
                    <img
                      src={
                        mentorship.mentor.profilePicture.startsWith("http")
                          ? mentorship.mentor.profilePicture
                          : `http://localhost:5000/uploads/${mentorship.mentor.profilePicture}`
                      }
                      alt={mentorship.mentor.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-[#5DB2B3]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(mentorship.mentor.name) +
                          "&background=136269&color=fff";
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {mentorship.mentor.name}
                    </h3>
                    {mentorship.mentor.title && (
                      <p className="text-gray-600">{mentorship.mentor.title}</p>
                    )}
                    {mentorship.mentor.email && (
                      <p className="text-sm text-gray-500">
                        {mentorship.mentor.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About This Mentorship
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {mentorship.description}
              </p>
            </div>

            {/* Requirements */}
            {mentorship.requirements && mentorship.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {mentorship.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#5DB2B3] bg-opacity-20 flex items-center justify-center mt-0.5">
                        <span className="text-[#136269] text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <span className="ml-3 text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Information */}
            {mentorship.contactEmail &&
              mentorship.contactPhone &&
              mentorship.communityLink && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    {mentorship.contactEmail && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#5DB2B3] bg-opacity-20 flex items-center justify-center">
                          <EnvelopeIcon className="h-5 w-5 text-[#136269]" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Email
                          </p>
                          <a
                            href={`mailto:${mentorship.contactEmail}`}
                            className="text-[#136269] hover:text-[#5DB2B3] transition-colors duration-200"
                          >
                            {mentorship.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}

                    {mentorship.contactPhone && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#5DB2B3] bg-opacity-20 flex items-center justify-center">
                          <PhoneIcon className="h-5 w-5 text-[#136269]" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Phone
                          </p>
                          <a
                            href={`tel:${mentorship.contactPhone}`}
                            className="text-[#136269] hover:text-[#5DB2B3] transition-colors duration-200"
                          >
                            {mentorship.contactPhone}
                          </a>
                        </div>
                      </div>
                    )}

                    {mentorship.communityLink && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#5DB2B3] bg-opacity-20 flex items-center justify-center">
                          <UserGroupIcon className="h-5 w-5 text-[#136269]" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Community Link
                          </p>
                          <a
                            href={mentorship.communityLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#136269] hover:text-[#5DB2B3] transition-colors duration-200"
                          >
                            Join Community
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipDetail;
