import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  FireIcon,
  ClockIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  BookmarkIcon,
  ShareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import ProfilePopup from "../components/ProfilePopup";
import ChatBox from "../components/ChatBox";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(response.data);
      setEditContent(response.data.content);
      setIsLiked(response.data.likes.includes(user?._id));
    } catch (err) {
      setError("Failed to fetch post. Please try again.");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLiked(!isLiked);
      fetchPost();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }

    if (!newComment.trim()) return;

    try {
      // First, ensure we have the latest post data
      const postResponse = await axios.get(
        `http://localhost:5000/api/posts/${id}`
      );
      const currentPost = postResponse.data;

      // Then post the comment
      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Create notification for the post author
      if (currentPost.author && currentPost.author._id !== user._id) {
        try {
          await axios.post(
            "http://localhost:5000/api/notifications/create",
            {
              recipientId: currentPost.author._id,
              senderId: user._id,
              type: "comment",
              content: `${user.name} commented on your post: "${currentPost.title}"`,
              postId: id,
              link: `/post/${id}`,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Comment notification sent successfully");
        } catch (notifError) {
          console.error("Error creating comment notification:", notifError);
        }
      }

      setNewComment("");
      fetchPost(); // Refresh the post data
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        { content: editContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPost((prev) => ({
        ...prev,
        content: editContent,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/posts");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    // Implement share functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#136269]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/posts")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#136269] transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Posts
          </button>
        </div>

        {/* Post Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-[#136269] to-[#5DB2B3]">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">{post.title}</h1>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleShare}
                  className="p-1 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <ShareIcon className="h-3.5 w-3.5" />
                </button>
                <button className="p-1 text-white hover:bg-white/10 rounded-full transition-colors duration-200">
                  <BookmarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-3">
            {/* Author Info */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {post.author?.profilePicture ? (
                  <img
                    src={
                      post.author.profilePicture.startsWith("http")
                        ? post.author.profilePicture
                        : `http://localhost:5000${post.author.profilePicture}`
                    }
                    alt={post.author.name}
                    className="h-6 w-6 rounded-full ring-1 ring-[#136269] object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "http://localhost:5000/uploads/profiles/default.png";
                    }}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-[#136269] flex items-center justify-center ring-1 ring-[#136269]">
                    <span className="text-xs font-medium text-white">
                      {post.author?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <div className="ml-2">
                  <button 
                    onClick={() => {
                      setSelectedUser(post.author);
                      setShowProfilePopup(true);
                    }}
                    className="text-xs font-medium text-gray-900 hover:text-[#136269] transition-colors"
                  >
                    {post.author?.name || "Unknown User"}
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-0.5" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FireIcon className="h-3 w-3 mr-0.5" />
                      {post.views} views
                    </span>
                  </div>
                </div>
              </div>
              {user && post.author && user.id === post.author._id && (
                <div className="ml-auto flex items-center space-x-1">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-0.5 text-gray-600 hover:text-[#136269] transition-colors duration-200"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-0.5 text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="prose max-w-none mb-3">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-200 text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEdit}
                      className="px-2 py-1 bg-[#136269] text-white rounded-lg hover:bg-[#0f4a52] transition-colors duration-200 text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="space-y-4">
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden shadow-sm group"
                        >
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`${post.title} - Image ${index + 1}`}
                            className="w-full h-auto max-h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center space-x-3 py-2 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 group transition-all duration-200 ${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-4 w-4 transform group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <HeartIcon className="h-4 w-4 transform group-hover:scale-110 transition-transform duration-200" />
                )}
                <span className="text-xs font-medium">{post.likes.length}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {post.comments.length}
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Comments
              </h2>

              {user ? (
                <form onSubmit={handleComment} className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-200 text-sm"
                    rows={2}
                  />
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-2 py-1 bg-[#136269] text-white rounded-lg hover:bg-[#0f4a52] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 mb-4">
                  <p className="text-xs text-gray-600">
                    Please{" "}
                    <Link
                      to="/login"
                      className="text-[#136269] hover:underline font-medium"
                    >
                      log in
                    </Link>{" "}
                    to comment.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2 group">
                    <div className="flex-shrink-0">
                      {comment.author?.profilePicture ? (
                        <img
                          src={
                            comment.author.profilePicture.startsWith("http")
                              ? comment.author.profilePicture
                              : `http://localhost:5000${comment.author.profilePicture}`
                          }
                          alt={comment.author.name}
                          className="h-5 w-5 rounded-full ring-1 ring-[#136269] object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "http://localhost:5000/uploads/profiles/default.png";
                          }}
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-[#136269] flex items-center justify-center ring-1 ring-[#136269]">
                          <span className="text-xs font-medium text-white">
                            {comment.author?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 group-hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-gray-900">
                          {comment.author?.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProfilePopup && (
        <ProfilePopup 
          user={selectedUser} 
          onClose={() => setShowProfilePopup(false)} 
        />
      )}
    </div>
  );
};

export default PostDetail;
