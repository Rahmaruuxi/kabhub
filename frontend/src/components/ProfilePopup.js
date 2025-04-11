import React, { useState } from "react";
import {
  UserIcon,
  XMarkIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import ChatBox from "./ChatBox";

const ProfilePopup = ({ user, onClose }) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith("http") 
                      ? user.profilePicture 
                      : `http://localhost:5000${user.profilePicture}`}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#5DB2B3]"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#5DB2B3]">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {user.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">About</h4>
                <p className="text-sm text-gray-600">{user.bio}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {user.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
                  <p className="text-sm text-gray-600">{user.location}</p>
                </div>
              )}
              {user.field && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Field</h4>
                  <p className="text-sm text-gray-600">{user.field}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowChat(true)}
              className="w-full flex items-center justify-center space-x-2 bg-[#136269] text-white px-4 py-2 rounded-lg hover:bg-[#0f4a52] transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
      {showChat && <ChatBox recipient={user} onClose={() => setShowChat(false)} />}
    </>
  );
};

export default ProfilePopup; 