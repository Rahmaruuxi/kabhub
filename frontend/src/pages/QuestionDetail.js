import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import {
  UserCircleIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProfilePopup from "../components/ProfilePopup";
import ChatBox from "../components/ChatBox";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: `/question/${id}` } });
      return;
    }

    fetchQuestion();
    
    // Set up socket connection
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    socketRef.current = io(apiUrl);
    
    // Join question room
    socketRef.current.emit("join-question", id);
    console.log(`Joined question room: ${id}`);
    
    // Listen for question updates
    socketRef.current.on("question-updated", (updatedQuestion) => {
      console.log("Question updated:", updatedQuestion);
      if (updatedQuestion._id === id) {
        setQuestion(updatedQuestion);
      }
    });
    
    // Listen for new answers
    socketRef.current.on("new-answer", (answer) => {
      console.log("New answer received:", answer);
      if (answer.question === id) {
        setQuestion((prev) => ({
          ...prev,
          answers: [...prev.answers, answer],
        }));
      }
    });
    
    // Listen for answer updates
    socketRef.current.on("answer-updated", (updatedAnswer) => {
      console.log("Answer updated:", updatedAnswer);
      if (updatedAnswer.question === id) {
        setQuestion((prev) => ({
          ...prev,
          answers: prev.answers.map((a) => 
            a._id === updatedAnswer._id ? updatedAnswer : a
          ),
        }));
      }
    });
    
    // Listen for answer deletions
    socketRef.current.on("answer-deleted", (answerId) => {
      console.log("Answer deleted:", answerId);
      setQuestion((prev) => ({
        ...prev,
        answers: prev.answers.filter((a) => a._id !== answerId),
      }));
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-question", id);
        socketRef.current.disconnect();
      }
    };
  }, [id, token, navigate]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.get(
        `${apiUrl}/api/questions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestion(response.data);
      setEditedQuestion({
        title: response.data.title,
        content: response.data.content,
        tags: response.data.tags.join(", "),
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch question");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${apiUrl}/api/answers`,
        { content: newAnswer, questionId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Immediately update the UI with the new answer
      const newAnswerData = response.data;
      setQuestion((prev) => ({
        ...prev,
        answers: [...(prev.answers || []), newAnswerData],
      }));
      
      setNewAnswer("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.put(
        `${apiUrl}/api/questions/${id}`,
        {
          ...editedQuestion,
          tags: editedQuestion.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // The socket event will handle updating the question state
      setShowEditForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update question");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/questions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136269]"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-500">Question not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Back Button */}
      <button
        onClick={() => navigate("/questions")}
        className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-[#136269] bg-[#136269]/10 rounded-lg hover:bg-[#136269]/20 transition-colors duration-200"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Questions
      </button>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {question && (
          <>
            <div className="p-6">
              {/* Author and Date Section */}
              <div className="flex items-center space-x-4 mb-4">
                {question.author?.profilePicture ? (
                  <img
                    src={
                      question.author.profilePicture.startsWith("http")
                        ? question.author.profilePicture
                        : `http://localhost:5000${question.author.profilePicture}`
                    }
                    alt={question.author?.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "http://localhost:5000/uploads/profiles/default.png";
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#136269] flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {question.author?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <div className="ml-2">
                  <button 
                    onClick={() => {
                      setSelectedUser(question.author);
                      setShowProfilePopup(true);
                    }}
                    className="text-xs font-medium text-gray-900 hover:text-[#136269] transition-colors"
                  >
                    {question.author?.name || "Unknown User"}
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <p className="text-xs text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Title and Content */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                {question.title}
              </h1>

              {question.image && (
                <div className="mb-6">
                  <img
                    src={getImageUrl(question.image)}
                    alt="Question"
                    className="w-full h-auto rounded-lg object-cover max-h-[400px]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "http://localhost:5000/uploads/default-image.png";
                    }}
                  />
                </div>
              )}

              <div className="prose max-w-none mb-6">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {question.content}
                </p>
              </div>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#136269]/10 text-[#136269]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>{question.views || 0} views</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>{question.answers?.length || 0} answers</span>
                </div>
                
                {/* Edit/Delete buttons for author */}
                {user && user.id === question.author?._id && (
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      onClick={() => setShowEditForm(!showEditForm)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#136269] hover:bg-[#136269]/10 rounded-md transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteQuestion}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {showEditForm && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <form onSubmit={handleUpdateQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editedQuestion.title}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          title: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={editedQuestion.content}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          content: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editedQuestion.tags}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          tags: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#136269] text-white rounded-lg hover:bg-[#0f4a52]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Answers Section */}
            <div className="border-t border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {question.answers?.length || 0} Answers
                </h2>

                {user ? (
                  <form onSubmit={handleSubmitAnswer} className="mb-6">
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#136269] focus:border-[#136269] placeholder-gray-400"
                      placeholder="Write your answer here..."
                      required
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#136269]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136269]"
                      >
                        Post Answer
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p className="text-sm text-yellow-700">
                      Please log in to post an answer.
                    </p>
                  </div>
                )}

                {/* Answers List */}
                <div className="space-y-6">
                  {question.answers && question.answers.length > 0 ? (
                    question.answers.map((answer) => (
                      <div
                        key={answer._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          {answer.author?.profilePicture ? (
                            <img
                              src={answer.author.profilePicture}
                              alt={answer.author?.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#136269] flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {answer.author?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {answer.author?.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {new Date(answer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {answer.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No answers yet. Be the first to answer!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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

export default QuestionDetail;
