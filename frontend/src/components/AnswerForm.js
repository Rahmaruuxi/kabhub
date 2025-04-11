import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  XMarkIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

const AnswerForm = ({ questionId, onAnswerPosted }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Post the answer
      const response = await axios.post(
        `http://localhost:5000/api/answers`,
        { content: content, questionId: questionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setContent("");
      if (onAnswerPosted) {
        onAnswerPosted(response.data);
      }
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error posting answer:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to post answer. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please log in to post an answer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Your Answer
        </h3>

        <form onSubmit={handleSubmit} className="mt-5">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XMarkIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Answer posted successfully!
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-1">
            <textarea
              id="content"
              name="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#5DB2B3] focus:border-[#136269] sm:text-sm"
              placeholder="Write your answer here..."
              required
            />
          </div>

          <div className="mt-5">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#136269] hover:bg-[#5DB2B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] disabled:opacity-50 transition-colors duration-200"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              {isSubmitting ? "Posting..." : "Post Answer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnswerForm;
