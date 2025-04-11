import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative group">
          {post.author.profilePicture ? (
            <div className="relative">
              <img
                src={`http://localhost:5000${post.author.profilePicture}`}
                alt={post.author.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-[#5DB2B3] hover:border-[#136269] transition-all duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
            </div>
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#5DB2B3] hover:border-[#136269] transition-all duration-200 group-hover:scale-105">
              <UserCircleIcon className="h-12 w-12 text-[#5DB2B3]" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <Link 
            to={`/profile/${post.author._id}`} 
            className="text-sm font-medium text-gray-900 hover:text-[#136269] transition-colors duration-200"
          >
            {post.author.name}
          </Link>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Link to={`/posts/${post._id}`} className="block">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-[#136269] transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-gray-600 line-clamp-3">{post.content}</p>
      </Link>

      {post.images && post.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {post.images.slice(0, 2).map((image, index) => (
            <img
              key={index}
              src={`http://localhost:5000${image}`}
              alt={`Post image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
          {post.images.length > 2 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
              +{post.images.length - 2}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard; 