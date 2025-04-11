import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Scholarships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'open',
    level: '',
    type: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchScholarships();
  }, [filters, sortBy]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.type) queryParams.append('type', filters.type);
      queryParams.append('sort', sortBy);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`http://localhost:5000/api/scholarships?${queryParams}`, { headers });
      setScholarships(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError(err.response?.data?.message || 'Failed to fetch scholarships. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`http://localhost:5000/api/scholarships/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setScholarships(scholarships.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      alert(error.response?.data?.message || 'Failed to delete scholarship. Please try again later.');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic':
        return <AcademicCapIcon className="h-5 w-5 text-[#136269]" />;
      case 'technical':
        return <BriefcaseIcon className="h-5 w-5 text-[#136269]" />;
      case 'research':
        return <AcademicCapIcon className="h-5 w-5 text-[#136269]" />;
      default:
        return <AcademicCapIcon className="h-5 w-5 text-[#136269]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-[#5DB2B3] text-white';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
        <span className="ml-3 text-gray-500">Loading scholarships...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchScholarships}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0d4a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#136269]">Scholarships</h1>
          <p className="mt-2 text-sm text-gray-600">
            Find educational opportunities and scholarships to advance your career
          </p>
        </div>
        {user && (
          <button
            onClick={() => navigate('/create-scholarship')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0d4a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Post Scholarship
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AcademicCapIcon className="h-5 w-5 text-[#136269]" />
            </div>
            <input
              type="text"
              placeholder="Search scholarships..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#136269] focus:border-[#136269] sm:text-sm"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#136269] focus:border-[#136269] sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="technical">Technical</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#136269] focus:border-[#136269] sm:text-sm rounded-md"
          >
            <option value="">All Levels</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD</option>
            <option value="diploma">Diploma</option>
            <option value="certificate">Certificate</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#136269] focus:border-[#136269] sm:text-sm rounded-md"
          >
            <option value="">All Types</option>
            <option value="full">Full Scholarship</option>
            <option value="partial">Partial Scholarship</option>
            <option value="tuition">Tuition Only</option>
            <option value="living">Living Expenses</option>
          </select>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.search || filters.level || filters.type) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5DB2B3] text-white">
                Category: {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5DB2B3] text-white">
                Search: {filters.search}
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {filters.level && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5DB2B3] text-white">
                Level: {filters.level}
                <button
                  onClick={() => setFilters({ ...filters, level: '' })}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5DB2B3] text-white">
                Type: {filters.type}
                <button
                  onClick={() => setFilters({ ...filters, type: '' })}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scholarships List */}
      {scholarships.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-[#136269]" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No scholarships found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.category || filters.search || filters.level || filters.type
              ? 'Try adjusting your filters'
              : 'Be the first to post a scholarship opportunity!'}
          </p>
          {user && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/create-scholarship')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#0d4a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post a Scholarship
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <div
              key={scholarship._id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {scholarship.author.profilePicture ? (
                      <img
                        src={scholarship.author.profilePicture.startsWith('http') 
                          ? scholarship.author.profilePicture 
                          : `http://localhost:5000${scholarship.author.profilePicture}`}
                        alt={scholarship.author.name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'http://localhost:5000/uploads/profiles/default.png';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{scholarship.title}</h3>
                      <p className="text-sm text-gray-500">Posted by {scholarship.author.name}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                    {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{scholarship.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    {scholarship.category.charAt(0).toUpperCase() + scholarship.category.slice(1)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    {scholarship.amount} {scholarship.currency}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {scholarship.location}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {user && scholarship.author && scholarship.author._id === user._id && (
                    <>
                      <button
                        onClick={() => navigate(`/edit-scholarship/${scholarship._id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-[#136269] shadow-sm text-sm font-medium rounded-md text-[#136269] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(scholarship._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </>
                  )}
                  {user && scholarship.status === 'open' && scholarship.author && scholarship.author._id !== user._id && (
                    <button
                      onClick={() => navigate(`/scholarship/${scholarship._id}`)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#136269] hover:bg-[#0d4a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scholarships; 