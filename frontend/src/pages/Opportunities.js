import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Opportunities = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const searchTimeoutRef = React.useRef(null);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: "/opportunities" } });
      return;
    }

    fetchAllOpportunities();
  }, [token, navigate]);

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, allOpportunities]);

  const fetchAllOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/opportunities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllOpportunities(response.data);

      // Extract unique locations from opportunities and filter out null/undefined values
      const locations = [
        ...new Set(
          response.data
            .map((opp) => opp.location)
            .filter((location) => location && location.trim() !== "")
        ),
      ];
      setAvailableLocations(locations);

      setError(null);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError(err.response?.data?.message || "Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);

    // Start with all opportunities
    let filteredOpportunities = [...allOpportunities];

    // Apply type filter
    if (filters.type) {
      filteredOpportunities = filteredOpportunities.filter(
        (opp) => opp.type === filters.type
      );
    }

    // Apply location filter - make it case insensitive
    if (filters.location) {
      console.log("Filtering by location:", filters.location);
      console.log("Available locations:", availableLocations);

      filteredOpportunities = filteredOpportunities.filter(
        (opp) =>
          opp.location &&
          opp.location.toLowerCase() === filters.location.toLowerCase()
      );

      console.log(
        "Filtered opportunities count:",
        filteredOpportunities.length
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm) ||
          opp.company.toLowerCase().includes(searchTerm) ||
          opp.description.toLowerCase().includes(searchTerm)
      );
    }

    setOpportunities(filteredOpportunities);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    e.preventDefault(); // Prevent any default form submission behavior
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply filters immediately for dropdown changes
    applyFilters();
  };

  // Improved search function with proper debounce using useRef
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 800); // Increased debounce time to 800ms
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "job":
        return <BriefcaseIcon className="h-5 w-5 text-[#136269]" />;
      case "internship":
        return <AcademicCapIcon className="h-5 w-5 text-[#136269]" />;
      case "scholarship":
        return <UserGroupIcon className="h-5 w-5 text-[#136269]" />;
      case "other":
        return <UserGroupIcon className="h-5 w-5 text-[#136269]" />;
      default:
        return <BriefcaseIcon className="h-5 w-5 text-[#136269]" />;
    }
  };

  const clearFilters = () => {
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setFilters({
      type: "",
      location: "",
      search: "",
    });
  };

  const handleViewDetails = (opportunity) => {
    navigate(`/opportunity/${opportunity._id}`, { state: { opportunity } });
  };

  const handleDelete = async (opportunityId) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/opportunities/${opportunityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted opportunity from both states
        setOpportunities((prevOpportunities) =>
          prevOpportunities.filter((opp) => opp._id !== opportunityId)
        );
        setAllOpportunities((prevOpportunities) =>
          prevOpportunities.filter((opp) => opp._id !== opportunityId)
        );
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete opportunity");
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
      {/* Header Section */}
      <div className="bg-[#1b8591] bg-opacity-90 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
            Discover Opportunities
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Find scholarships, internships, and career opportunities shared by
            your community
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mt-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <h2 className="text-3xl font-bold text-[#136269] tracking-tight">
              Available Opportunities
            </h2>
            {user && (
              <button
                onClick={() => navigate("/create-opportunity")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#136269] hover:bg-[#0f4a52] transition-colors duration-200 shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post Opportunity
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by title, company, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="">All Types</option>
                <option value="job">Jobs</option>
                <option value="internship">Internships</option>
                <option value="scholarship">Scholarships</option>
                <option value="volunteer">Volunteer</option>
              </select>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="">All Locations</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {(filters.type || filters.location || filters.search) && (
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

          {/* Active Filters */}
          {(filters.type || filters.location || filters.search) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5DB2B3]/10 text-[#136269]">
                  Type: {filters.type}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, type: "" }));
                      applyFilters();
                    }}
                    className="ml-2 hover:text-[#0f4a52]"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#5DB2B3]/10 text-[#136269]">
                  Location: {filters.location}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, location: "" }));
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

          {/* Opportunities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto h-24 w-24 text-[#136269] mb-4">
                  <BriefcaseIcon className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No opportunities yet
                </h3>
                <p className="text-gray-500">
                  Be the first to share an opportunity with the community
                </p>
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <div
                  key={opportunity._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {opportunity.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {opportunity.company}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        opportunity.type === "job"
                          ? "bg-blue-100 text-blue-800"
                          : opportunity.type === "internship"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {opportunity.type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Deadline:{" "}
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </div>

                    <div className="flex items-center space-x-2">
                      {user && opportunity.author && (
                        <>
                          {(() => {
                            // Safely get user ID
                            const userId = user._id || user.id;
                            // Safely get author ID
                            const authorId =
                              opportunity.author._id || opportunity.author;

                            // Only render if we have valid IDs to compare
                            return (
                              userId &&
                              authorId &&
                              userId.toString() === authorId.toString() && (
                                <>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/edit-opportunity/${opportunity._id}`
                                      )
                                    }
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#136269] bg-[#136269]/10 rounded-md hover:bg-[#136269]/20 transition-all duration-200"
                                  >
                                    <PencilIcon className="h-3.5 w-3.5 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDelete(opportunity._id)
                                    }
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-all duration-200"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                    Delete
                                  </button>
                                </>
                              )
                            );
                          })()}
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetails(opportunity)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#136269] rounded-lg hover:bg-[#0f4a52] transition-all duration-200"
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

export default Opportunities;
