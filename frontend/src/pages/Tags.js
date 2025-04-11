import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  HashtagIcon,
  QuestionMarkCircleIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/outline';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tags');
      setTags(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tags');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.questionCount - a.questionCount;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <HashtagIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {filteredTags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tags found
            </div>
          ) : (
            filteredTags.map((tag) => (
              <div key={tag._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/tags/${tag.name}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200"
                    >
                      <HashtagIcon className="h-4 w-4 mr-1" />
                      {tag.name}
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">
                      {tag.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <QuestionMarkCircleIcon className="h-5 w-5 mr-1" />
                      {tag.questionCount} questions
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FireIcon className="h-5 w-5 mr-1" />
                      {tag.followersCount} followers
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Recent questions
                  </h3>
                  <div className="space-y-2">
                    {tag.recentQuestions?.map((question) => (
                      <Link
                        key={question._id}
                        to={`/question/${question._id}`}
                        className="block text-sm text-gray-600 hover:text-primary-600"
                      >
                        {question.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Created {new Date(tag.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tags; 