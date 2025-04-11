import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  FireIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid
} from '@heroicons/react/24/outline';

const SearchPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'newest',
    timeRange: 'all'
  });

  const categories = [
    { id: 'all', name: 'All Posts', icon: ChatBubbleLeftIcon },
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon },
    { id: 'career', name: 'Career', icon: BriefcaseIcon },
    { id: 'social', name: 'Social', icon: UserGroupIcon }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'mostLiked', name: 'Most Liked' },
    { id: 'mostCommented', name: 'Most Commented' }
  ];

  const timeRanges = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' }
  ];

  useEffect(() => {
    if (searchQuery) {
      fetchPosts();
    }
  }, [searchQuery, filters]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/posts/search', {
        params: {
          query: searchQuery,
          ...filters
        }
      });
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getSortIcon = (sort) => {
    switch (sort) {
      case 'newest':
        return <ClockIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />;
      case 'mostLiked':
        return <FireIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />;
      case 'mostCommented':
        return <ChatBubbleLeftIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#5DB2B3]">
        <div className="px-6 py-5 border-b border-gray-200 bg-[#136269]">
          <h1 className="text-2xl font-bold text-white">Search Posts</h1>
        </div>

        <div className="px-6 py-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#136269] text-white rounded-lg hover:bg-[#0f4a52] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#136269] mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FireIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />
                        {post.likes.length}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />
                        {post.comments.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        {getSortIcon(filters.sort)}
                        <span>
                          {filters.sort === 'newest'
                            ? new Date(post.createdAt).toLocaleDateString()
                            : filters.sort === 'mostLiked'
                            ? `${post.likes.length} likes`
                            : `${post.comments.length} comments`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <EyeIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />
                        {post.views} views
                      </div>
                    </div>

                    <div className="flex items-center">
                      {post.author.profilePicture ? (
                        <img
                          src={post.author.profilePicture}
                          alt={post.author.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#136269] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {post.author.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPosts; 