import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  UserCircleIcon,
  PhotoIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Posts = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: "/posts" } });
      return;
    }

    fetchPosts();
  }, [token, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      navigate("/login", { state: { from: "/posts" } });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: response.data.likes || [],
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Like error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to like post. Please try again.";
      setError(errorMessage);
    }
  };

  const handleEdit = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                content: editContent,
              }
            : post
        )
      );
      setEditingPost(null);
      setEditContent("");
    } catch (err) {
      console.error("Edit error:", err);
      setError(err.response?.data?.message || "Failed to edit post");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete post");
    }
  };

  const startEditing = (post) => {
    setEditingPost(post._id);
    setEditContent(post.content);
  };

  const toggleExpand = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#136269]">Posts</h1>
          {user && (
            <button
              onClick={() => navigate("/create-post")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#136269] hover:bg-[#0f4a52] shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Post
            </button>
          )}
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-[#5DB2B3] hover:shadow-lg transition-shadow duration-200 p-4"
            >
              {/* Author Information */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {post.author && post.author.profilePicture ? (
                    <img
                      src={
                        post.author.profilePicture.startsWith("http")
                          ? post.author.profilePicture
                          : `http://localhost:5000${post.author.profilePicture}`
                      }
                      alt={post.author.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "http://localhost:5000/uploads/profiles/default.png";
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#136269] flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {post.author?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {post.author?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/post/${post._id}`)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#136269] bg-[#136269]/10 rounded-lg hover:bg-[#136269]/20 transition-colors duration-200"
                >
                  View Details
                </button>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {post.title}
                </h2>
                {editingPost === post._id ? (
                  <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#136269] focus:border-transparent transition-all duration-200 text-sm"
                      rows="4"
                      placeholder="Edit your post..."
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingPost(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEdit(post._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#136269] rounded-lg hover:bg-[#0f4a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269] transition-all duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className={`text-gray-600 ${!expandedPosts.has(post._id) && 'line-clamp-3'}`}>
                      {post.content}
                    </p>
                    {post.content.length > 200 && (
                      <button
                        onClick={() => toggleExpand(post._id)}
                        className="mt-1 text-[#136269] text-sm hover:text-[#0f4a52] font-medium"
                      >
                        {expandedPosts.has(post._id) ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-4">
                  <img
                    src={`http://localhost:5000${post.images[0]}`}
                    alt={post.title}
                    className="rounded-lg max-h-96 w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "http://localhost:5000/uploads/default-post.png";
                    }}
                  />
                </div>
              )}

              {/* Post Footer */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center ${
                      post.likes?.includes(user?._id)
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <HeartIcon className="h-4 w-4 mr-1" />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/post/${post._id}#comments`)}
                    className="flex items-center text-gray-500 hover:text-[#136269]"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span>{post.views || 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user && user._id === post.author?._id && (
                    <>
                      <button
                        onClick={() => startEditing(post)}
                        className="p-1 text-gray-500 hover:text-[#136269]"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;
