import React from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CodeBracketIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 overflow-hidden bg-gradient-to-br from-[#136269]/5 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#5DB2B3]/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#136269]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left mt-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#136269] mb-6 leading-tight animate-fade-in-up">
                Empowering Somali{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#136269] to-[#5DB2B3]">
                  Students Worldwide
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-100">
                Your gateway to academic excellence, mentorship, and endless
                opportunities. Join a community where knowledge meets ambition.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-200">
                <Link
                  to="/register"
                  className="bg-[#136269] text-white hover:bg-[#1a7a82] font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 shadow-md"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Start Your Journey
                </Link>
                <Link
                  to="/about"
                  className="bg-transparent border-2 border-[#136269] text-[#136269] hover:bg-[#136269]/5 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  Explore Features
                </Link>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative mt-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/home.png"
                  alt="Students collaborating in a modern learning environment"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#136269]/30 to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#5DB2B3]/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#136269]/20 rounded-full animate-pulse-delayed"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#136269] mb-4">
              Your Gateway to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover a platform designed to support your educational journey
              and connect you with opportunities
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-[#136269]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AcademicCapIcon className="h-8 w-8 text-[#136269]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Academic Support</h3>
              <p className="text-gray-600">
                Get help with your studies from experienced mentors and connect
                with peers who share your academic goals
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-[#136269]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-[#136269]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Network</h3>
              <p className="text-gray-600">
                Join a supportive community of Somali students and professionals
                who are ready to help you succeed
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-[#136269]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="h-8 w-8 text-[#136269]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Opportunities</h3>
              <p className="text-gray-600">
                Access scholarships, internships, and career opportunities
                specifically for Somali students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#136269] mb-2">
                1000+
              </div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#136269] mb-2">500+</div>
              <div className="text-gray-600">Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#136269] mb-2">200+</div>
              <div className="text-gray-600">Scholarships</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#136269] mb-2">50+</div>
              <div className="text-gray-600">Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-[#136269]/80 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/3 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/3 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-fade-in-up">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-100">
              Take the first step towards your educational success. Join
              thousands of Somali students who are already benefiting from our
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
              <Link
                to="/register"
                className="bg-white text-[#136269] hover:bg-white/90 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 shadow-md"
              >
                <SparklesIcon className="h-6 w-6" />
                Get Started Now
              </Link>
              <Link
                to="/about"
                className="bg-white text-[#136269] hover:bg-white/90 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
              >
                <AcademicCapIcon className="h-6 w-6" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#5DB2B3]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#136269]/20 rounded-full blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/about.png"
                  alt="About KAAB HUB"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#136269]/30 to-transparent"></div>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-[#136269] mb-6">
                About KAAB HUB
              </h2>
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  KAAB HUB was born from a simple idea: every student deserves a
                  strong support system. In Somalia, where students often lack
                  access to reliable mentorship, guidance, and educational
                  resources, we saw a chance to create something impactful.
                </p>
                <p className="text-xl text-gray-700 leading-relaxed">
                  What started as a dream to connect curious learners with
                  skilled locals has grown into a vibrant platform. Here,
                  students ask real questions, mentors offer real support, and
                  opportunity becomes a shared resource. We're not just a
                  website — we're a movement.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-[#136269]/10 rounded-full flex items-center justify-center mr-4">
                    <HeartIcon className="h-7 w-7 text-[#136269]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#136269]">
                      Community First
                    </h3>
                    <p className="text-gray-600">Building together</p>
                  </div>
                </div>
                <div className="flex items-center bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-[#136269]/10 rounded-full flex items-center justify-center mr-4">
                    <AcademicCapIcon className="h-7 w-7 text-[#136269]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#136269]">
                      Education Focus
                    </h3>
                    <p className="text-gray-600">Learning together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-[#136269]/5 to-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#5DB2B3]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#136269]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-[#136269] mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions or suggestions? We'd love to hear from you. Send us
              a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Form Card Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5DB2B3]/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#136269]/5 rounded-full blur-2xl"></div>

            <form className="space-y-8 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-300 hover:border-[#5DB2B3]/50"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-300 hover:border-[#5DB2B3]/50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-300 hover:border-[#5DB2B3]/50"
                  placeholder="Message subject"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent transition-all duration-300 hover:border-[#5DB2B3]/50"
                  placeholder="Your message"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="w-full bg-[#136269] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a7a82] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <svg
                    className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Beautiful Footer */}
      <footer className="bg-[#136269] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                KAAB HUB
              </h2>
              <p className="text-white/80 text-sm max-w-xs">
                Empowering Somali students through knowledge and community.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/opportunities"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Scholarships
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/mentorships"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Mentorship
                  </Link>
                </li>
                <li>
                  <Link
                    to="/opportunities"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Opportunities
                  </Link>
                </li>
                <li>
                  <Link
                    to="/questions"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Q&A Forum
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/80">
            <p>
              &copy; {new Date().getFullYear()} KAAB HUB. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
