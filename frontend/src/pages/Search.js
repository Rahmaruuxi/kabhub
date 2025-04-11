import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  SearchIcon,
  QuestionMarkCircleIcon,
  ChatAlt2Icon,
  ThumbUpIcon,
  EyeIcon,
  SortAscendingIcon,
  FilterIcon
} from '@heroicons/react/outline';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: {
          q: query,
          filter,
          sort: sortBy
        }
      });
      setResults(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to perform search');
      console.error('Error performing search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    performSearch();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    performSearch();
  };

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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Results for "{query}"
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                readOnly
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FilterIcon className="h-5 w-5 mr-1" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filter === 'all'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('questions')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filter === 'questions'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => handleFilterChange('answers')}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filter === 'answers'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Answers
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="votes">Most votes</option>
                    <option value="answers">Most answers</option>
                    <option value="views">Most views</option>
                  </select>
                  <SortAscendingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            results.map((result) => (
              <div key={result._id} className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-center w-16">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.upvotes?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">votes</div>
                  </div>
                  <div className="flex-shrink-0 text-center w-16 ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.answers?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">answers</div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        to={`/question/${result._id}`}
                        className="hover:text-primary-600"
                      >
                        {result.title}
                      </Link>
                    </h3>
                    <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {result.content}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Asked {new Date(result.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{result.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search; 