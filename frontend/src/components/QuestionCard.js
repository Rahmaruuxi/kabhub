import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ChatBubbleLeftIcon, 
  EyeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const QuestionCard = ({ question }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-4 border border-gray-100 hover:border-[#136269]/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          {question.author.profilePicture ? (
            <img
              src={question.author.profilePicture.startsWith('http') 
                ? question.author.profilePicture 
                : `http://localhost:5000${question.author.profilePicture}`}
              alt={question.author.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 hover:border-[#136269] transition-all duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'http://localhost:5000/uploads/profiles/default.png';
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#136269] to-[#1a7f8c] flex items-center justify-center border-2 border-gray-100 hover:border-[#136269] transition-all duration-300">
              <span className="text-sm font-medium text-white">
                {question.author?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div>
          <Link to={`/profile/${question.author._id}`} className="text-sm font-medium text-gray-900 hover:text-[#136269] transition-colors duration-200">
            {question.author.name}
          </Link>
          <p className="text-xs text-gray-500">
            {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Link to={`/questions/${question._id}`} className="block group">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#136269] transition-colors duration-200">
          {question.title}
        </h2>
        <p className="text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
          {question.content}
        </p>
      </Link>

      {question.tags && question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium bg-[#136269]/5 text-[#136269] rounded-full flex items-center gap-1 hover:bg-[#136269]/10 transition-colors duration-200"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center space-x-6 text-sm">
        <div className="flex items-center text-gray-500 hover:text-[#136269] transition-colors duration-200">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
          <span>{question.answers.length} إجابات</span>
        </div>
        <div className="flex items-center text-gray-500 hover:text-[#136269] transition-colors duration-200">
          <EyeIcon className="h-4 w-4 mr-1" />
          <span>{question.views} مشاهدة</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard; 