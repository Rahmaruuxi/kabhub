import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Mentorships = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
  });
  const [allMentorships, setAllMentorships] = useState([]);
  const searchTimeoutRef = React.useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: "/mentorships" } });
      return;
    }

    fetchAllMentorships();
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allMentorships]);

  const fetchAllMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/mentorships`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllMentorships(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching mentorships:", err);
      setError(err.response?.data?.message || "Failed to fetch mentorships");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);
    let filteredMentorships = [...allMentorships];

    // Apply category filter
    if (filters.category) {
      filteredMentorships = filteredMentorships.filter(
        (mentorship) =>
          mentorship.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredMentorships = filteredMentorships.filter(
        (mentorship) =>
          mentorship.title.toLowerCase().includes(searchTerm) ||
          mentorship.description.toLowerCase().includes(searchTerm) ||
          mentorship.category.toLowerCase().includes(searchTerm)
      );
    }

    setMentorships(filteredMentorships);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 800);
  };

  const clearFilters = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setFilters({
      category: "",
      search: "",
    });
  };

  const handleDelete = async (mentorshipId) => {
    if (!window.confirm("Are you sure you want to delete this mentorship?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/mentorships/${mentorshipId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMentorships((prevMentorships) =>
        prevMentorships.filter((mentorship) => mentorship._id !== mentorshipId)
      );
      setAllMentorships((prevMentorships) =>
        prevMentorships.filter((mentorship) => mentorship._id !== mentorshipId)
      );
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete mentorship");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1b8591] bg-opacity-90 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
            Find a Mentor
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Connect with experienced mentors who can guide you on your journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mt-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <h2 className="text-3xl font-bold text-[#136269] tracking-tight">
              Available Mentorships
            </h2>
            {user && (
              <button
                onClick={() => navigate("/create-mentorship")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#136269] hover:bg-[#0f4a52] transition-colors duration-200 shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Offer Mentorship
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by title or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="min-w-[160px]">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {(filters.category || filters.search) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  title="Clear filters"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {(filters.category || filters.search) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5DB2B3]/10 text-[#136269]">
                  Category:{" "}
                  {filters.category.charAt(0).toUpperCase() +
                    filters.category.slice(1)}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, category: "" }));
                      applyFilters();
                    }}
                    className="ml-2 hover:text-[#0f4a52]"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5DB2B3]/10 text-[#136269]">
                  Search: {filters.search}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, search: "" }));
                      applyFilters();
                    }}
                    className="ml-2 hover:text-[#0f4a52]"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorships.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto h-24 w-24 text-[#136269] mb-4">
                  <UserGroupIcon className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No mentorships available
                </h3>
                <p className="text-gray-500">
                  Be the first to offer mentorship to the community
                </p>
              </div>
            ) : (
              mentorships.map((mentorship) => (
                <div
                  key={mentorship._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {mentorship.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        {mentorship.category.charAt(0).toUpperCase() +
                          mentorship.category.slice(1)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {mentorship.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {mentorship.duration}{" "}
                      {mentorship.duration === 1 ? "month" : "months"}
                    </div>

                    <div className="flex items-center space-x-2">
                      {user &&
                        mentorship.mentor &&
                        (() => {
                          // Safely get user ID
                          const userId = user._id || user.id;
                          // Safely get mentor ID
                          const mentorId =
                            mentorship.mentor._id || mentorship.mentor;

                          // Only render if we have valid IDs to compare and user is the mentor
                          return (
                            userId &&
                            mentorId &&
                            userId.toString() === mentorId.toString() && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/edit-mentorship/${mentorship._id}`
                                    );
                                  }}
                                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#136269] bg-[#136269]/10 rounded-md hover:bg-[#136269]/20 transition-all duration-200"
                                >
                                  <PencilIcon className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(mentorship._id);
                                  }}
                                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-all duration-200"
                                >
                                  <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                  Delete
                                </button>
                              </>
                            )
                          );
                        })()}
                      <button
                        onClick={() =>
                          navigate(`/mentorship/${mentorship._id}`)
                        }
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#136269] rounded-md hover:bg-[#0f4a52] transition-all duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentorships;
