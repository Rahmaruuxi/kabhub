import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const AnswerCard = ({ answer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          {answer.author.profilePicture ? (
            <img
              src={answer.author.profilePicture.startsWith('http') 
                ? answer.author.profilePicture 
                : `http://localhost:5000${answer.author.profilePicture}`}
              alt={answer.author.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 hover:border-[#136269] transition-colors duration-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'http://localhost:5000/uploads/profiles/default.png';
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[#136269] flex items-center justify-center border-2 border-gray-200 hover:border-[#136269] transition-colors duration-200">
              <span className="text-sm font-medium text-white">
                {answer.author?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div>
          <Link to={`/profile/${answer.author._id}`} className="text-sm font-medium text-gray-900 hover:text-[#136269] transition-colors duration-200">
            {answer.author.name}
          </Link>
          <p className="text-xs text-gray-500">
            {new Date(answer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
    </div>
  );
};

export default AnswerCard; 