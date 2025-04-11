import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    course: "",
    year: "",
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // University validation
    if (!formData.university || formData.university.trim() === "") {
      newErrors.university = "University is required";
    }

    // Course validation
    if (!formData.course || formData.course.trim() === "") {
      newErrors.course = "Course is required";
    }

    // Year validation
    const yearNum = parseInt(formData.year);
    if (!formData.year || formData.year.trim() === "") {
      newErrors.year = "Year is required";
    } else if (isNaN(yearNum) || yearNum < 1 || yearNum > 7) {
      newErrors.year = "Year must be between 1 and 7";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          profileImage: "Image size should be less than 5MB",
        }));
        return;
      }

      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "Please upload a valid image file (JPG, PNG, or GIF)",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      if (errors.profileImage) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "",
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (!validateForm()) {
      return;
    }

    try {
      // Create a new object with trimmed values
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        university: formData.university.trim(),
        course: formData.course.trim(),
        year: parseInt(formData.year.trim(), 10),
      };

      const user = await register(trimmedData);
      if (user) {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        setErrors((prev) => ({
          ...prev,
          submit: error.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: "Registration failed. Please try again.",
        }));
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-[#136269]/5 to-[#5DB2B3]/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg my-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#136269]">Join KAAB HUB</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and start learning together
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover border-4 border-[#5DB2B3]"
                />
              ) : (
                <UserCircleIcon className="h-24 w-24 text-[#5DB2B3]" />
              )}
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-[#136269] rounded-full p-2 cursor-pointer hover:bg-[#136269]/90 transition-colors duration-200"
              >
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <input
                  type="file"
                  id="profile-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {errors.profileImage && (
              <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${errors.name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${errors.email ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${errors.password ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="university"
                className="block text-sm font-medium text-gray-700"
              >
                Organization
              </label>
              <div className="mt-1">
                <input
                  id="university"
                  name="university"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${
                      errors.university ? "border-red-300" : "border-gray-300"
                    }`}
                  placeholder="Enter your university"
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>
              {errors.university && (
                <p className="mt-1 text-sm text-red-600">{errors.university}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Fields
              </label>
              <div className="mt-1">
                <input
                  id="course"
                  name="course"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${errors.course ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Enter your course"
                  value={formData.course}
                  onChange={handleChange}
                />
              </div>
              {errors.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700"
              >
                Year of Study
              </label>
              <div className="mt-1">
                <input
                  id="year"
                  name="year"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#5DB2B3] focus:border-[#5DB2B3] sm:text-sm
                    ${errors.year ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Enter your year (1-7)"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>

          {authError && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {authError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#136269] hover:bg-[#136269]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DB2B3] transition-colors duration-200"
            >
              Create Account
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#136269] hover:text-[#5DB2B3] transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
