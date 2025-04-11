import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  HashtagIcon,
  QuestionMarkCircleIcon,
  FireIcon,
  ClockIcon,
  ThumbUpIcon,
  ChatAlt2Icon,
  EyeIcon,
  SortAscendingIcon
} from '@heroicons/react/outline';

const TagDetail = () => {
  const { name } = useParams();
  const { user, token } = useAuth();
  const [tag, setTag] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchTagData();
  }, [name]);

  const fetchTagData = async () => {
    try {
      const [tagResponse, questionsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/tags/${name}`),
        axios.get(`http://localhost:5000/api/tags/${name}/questions`)
      ]);

      setTag(tagResponse.data);
      setQuestions(questionsResponse.data);
      setIsFollowing(tagResponse.data.followers.includes(user?._id));
      setError(null);
    } catch (err) {
      setError('Failed to fetch tag data');
      console.error('Error fetching tag data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await axios.post(
        `http://localhost:5000/api/tags/${name}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTag(prev => ({
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error following/unfollowing tag:', err);
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'votes':
        return b.upvotes.length - a.upvotes.length;
      case 'answers':
        return b.answers.length - a.answers.length;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
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
        {/* Tag Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <HashtagIcon className="h-8 w-8 text-primary-600" />
                <h1 className="ml-2 text-3xl font-bold text-gray-900">
                  {tag.name}
                </h1>
              </div>
              <p className="mt-2 text-gray-500">
                {tag.description || 'No description available'}
              </p>
            </div>
            {user && (
              <button
                onClick={handleFollow}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <FireIcon className="h-5 w-5 mr-1" />
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="h-5 w-5 mr-1" />
              {tag.questionCount} questions
            </div>
            <div className="flex items-center">
              <FireIcon className="h-5 w-5 mr-1" />
              {tag.followersCount} followers
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-1" />
              Created {new Date(tag.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Questions tagged [{tag.name}]
              </h2>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="votes">Most votes</option>
                  <option value="answers">Most answers</option>
                  <option value="views">Most views</option>
                </select>
                <SortAscendingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedQuestions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No questions found with this tag
              </div>
            ) : (
              sortedQuestions.map((question) => (
                <div key={question._id} className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-center w-16">
                      <div className="text-2xl font-bold text-gray-900">
                        {question.upvotes.length}
                      </div>
                      <div className="text-sm text-gray-500">votes</div>
                    </div>
                    <div className="flex-shrink-0 text-center w-16 ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {question.answers.length}
                      </div>
                      <div className="text-sm text-gray-500">answers</div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link
                          to={`/question/${question._id}`}
                          className="hover:text-primary-600"
                        >
                          {question.title}
                        </Link>
                      </h3>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{question.views} views</span>
                      </div>
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

export default TagDetail; 