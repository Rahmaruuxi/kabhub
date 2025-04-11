import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  QuestionMarkCircleIcon,
  FireIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon as ChatAlt2Icon,
  FunnelIcon as FilterIcon,
  ArrowsUpDownIcon as SortAscendingIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    course: searchParams.get('course') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon },
    { id: 'career', name: 'Career', icon: BriefcaseIcon },
    { id: 'social', name: 'Social', icon: UserGroupIcon },
    { id: 'other', name: 'Other', icon: ChatBubbleLeftIcon }
  ];

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/questions?${queryParams}`
      );
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch questions. Please try again later.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      return newParams;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      course: '',
      tag: '',
      search: '',
      sort: 'createdAt'
    });
    setSearchParams({});
  };

  const handleCategoryClick = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryId ? '' : categoryId
    }));
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (prev.get('category') === categoryId) {
        newParams.delete('category');
      } else {
        newParams.set('category', categoryId);
      }
      return newParams;
    });
  };

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case 'createdAt':
        return <ClockIcon className="h-5 w-5" />;
      case 'views':
        return <EyeIcon className="h-5 w-5" />;
      case 'upvotes':
        return <FireIcon className="h-5 w-5" />;
      default:
        return <SortAscendingIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-[#136269] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Questions & Answers
          </h1>
          <p className="text-xl text-[#5DB2B3]">
            Ask questions, share knowledge, and learn from your community.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/ask"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#136269] hover:bg-[#5DB2B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition-colors duration-300"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
            Ask Question
          </Link>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-[#5DB2B3] mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-[#136269]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center text-white hover:text-[#5DB2B3] transition-colors duration-300"
              >
                <FilterIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              <div className="flex items-center">
                <SortAscendingIcon className="h-5 w-5 mr-2 text-[#5DB2B3]" />
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm rounded-lg bg-white"
                >
                  <option value="createdAt">Newest</option>
                  <option value="views">Most Viewed</option>
                  <option value="upvotes">Most Upvoted</option>
                </select>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map(({ id, name, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => handleCategoryClick(id)}
                        className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
                          filters.category === id
                            ? 'bg-[#136269] text-white border-[#136269]'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-2 ${
                          filters.category === id ? 'text-white' : 'text-[#136269]'
                        }`} />
                        <span className="text-sm font-medium">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={filters.course}
                      onChange={handleFilterChange}
                      placeholder="Filter by course"
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag
                    </label>
                    <input
                      type="text"
                      name="tag"
                      value={filters.tag}
                      onChange={handleFilterChange}
                      placeholder="Filter by tag"
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm"
                    />
                  </div>
                </div>

                {Object.values(filters).some(value => value) && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#136269] hover:text-[#5DB2B3] transition-colors duration-300"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg border border-[#5DB2B3]">
            <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-[#136269]" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new question.
            </p>
            <div className="mt-6">
              <Link
                to="/ask"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#136269] hover:bg-[#5DB2B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition-colors duration-300"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                Ask Question
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <Link
                key={question._id}
                to={`/question/${question._id}`}
                className="block bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border border-[#5DB2B3]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#136269]">
                        {question.title}
                      </h3>
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {question.content}
                      </p>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <div className="flex items-center text-sm text-gray-500">
                        <ChatAlt2Icon className="h-5 w-5 mr-1 text-[#5DB2B3]" />
                        {question.answers.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-sm text-gray-500">
                        {getSortIcon(filters.sort)}
                        <span className="ml-1">
                          {filters.sort === 'createdAt'
                            ? new Date(question.createdAt).toLocaleDateString()
                            : filters.sort === 'views'
                            ? `${question.views} views`
                            : `${question.upvotes.length} upvotes`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <EyeIcon className="h-5 w-5 mr-1 text-[#5DB2B3]" />
                        {question.views} views
                      </div>
                    </div>

                    <div className="flex items-center">
                      {question.author.profilePicture ? (
                        <img
                          src={question.author.profilePicture}
                          alt={question.author.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#136269] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {question.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {question.author.name}
                      </span>
                    </div>
                  </div>

                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5DB2B3]/10 text-[#136269]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 