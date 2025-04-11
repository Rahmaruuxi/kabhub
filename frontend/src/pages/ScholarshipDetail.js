import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  UserGroupIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ChatIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  AcademicCapIcon
} from '@heroicons/react/outline';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState(null);

  useEffect(() => {
    fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/scholarships/${id}`);
      setScholarship(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch scholarship details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplicationError(null);

    try {
      await axios.post(`http://localhost:5000/api/scholarships/${id}/apply`, {
        message: applicationMessage
      });
      fetchScholarship(); // Refresh to get updated status
      setApplicationMessage('');
    } catch (err) {
      setApplicationError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      await axios.put(`http://localhost:5000/api/scholarships/${id}/applications/${applicationId}`, {
        status: 'accepted'
      });
      fetchScholarship();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await axios.put(`http://localhost:5000/api/scholarships/${id}/applications/${applicationId}`, {
        status: 'rejected'
      });
      fetchScholarship();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/scholarships/${id}`);
      navigate('/scholarships');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete scholarship');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-gray-500">Loading scholarship details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchScholarship}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Scholarship not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The scholarship you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const isAuthor = user && scholarship.author._id === user._id;
  const hasApplied = user && scholarship.applications.some(
    app => app.applicant._id === user._id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {scholarship.author.profilePicture ? (
                <img
                  src={scholarship.author.profilePicture.startsWith('http') 
                    ? scholarship.author.profilePicture 
                    : `http://localhost:5000${scholarship.author.profilePicture}`}
                  alt={scholarship.author.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-[#5DB2B3]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:5000/uploads/profiles/default.png';
                  }}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#5DB2B3]">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {scholarship.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Posted by {scholarship.author.name}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              scholarship.status === 'open' ? 'bg-green-100 text-green-800' :
              scholarship.status === 'closed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{scholarship.description}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {scholarship.category.charAt(0).toUpperCase() + scholarship.category.slice(1)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Level</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {scholarship.level.charAt(0).toUpperCase() + scholarship.level.slice(1)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {scholarship.type.charAt(0).toUpperCase() + scholarship.type.slice(1)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {scholarship.amount} {scholarship.currency}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(scholarship.deadline).toLocaleDateString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{scholarship.location}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="mt-1 text-sm text-gray-900">{scholarship.provider}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Requirements</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="list-disc pl-5 space-y-1">
                  {scholarship.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Eligibility</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="list-disc pl-5 space-y-1">
                  {scholarship.eligibility.map((el, index) => (
                    <li key={index}>{el}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          {isAuthor && scholarship.status === 'open' && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => navigate(`/edit-scholarship/${id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </button>
            </div>
          )}

          {isAuthor && scholarship.status === 'open' && scholarship.applications.length > 0 && (
            <div className="mt-8 space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Applications</h4>
              {scholarship.applications.map((application) => (
                <div
                  key={application._id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {application.applicant.name}
                    </p>
                    <p className="text-sm text-gray-500">{application.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptApplication(application._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && !isAuthor && scholarship.status === 'open' && !hasApplied && (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Application Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Explain why you're interested in this scholarship..."
                />
              </div>
              {applicationError && (
                <div className="text-sm text-red-600">{applicationError}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={applying}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          )}

          {hasApplied && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                You have already applied for this scholarship. The provider will review your application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail; 