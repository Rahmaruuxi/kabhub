import React from "react";
import { useNavigate } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  LightBulbIcon,
  HeartIcon,
  SparklesIcon,
  ArrowPathIcon,
  UserIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const About = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      id: 1,
      quote:
        "KAAB HUB helped me find my dream scholarship. I'm now studying Computer Science at my dream university!",
      author: "Aisha Hassan",
      role: "Computer Science Student",
    },
    {
      id: 2,
      quote:
        "The mentorship I received through KAAB HUB was invaluable. It completely changed my career trajectory.",
      author: "Mohamed Ali",
      role: "Engineering Graduate",
    },
    {
      id: 3,
      quote:
        "As a mentor on KAAB HUB, I've seen firsthand how powerful community support can be for students.",
      author: "Fatima Omar",
      role: "Senior Software Engineer",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Pattern Background */}
      <div className="relative bg-gradient-to-r from-[#136269] to-[#1a7982] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight tracking-tight">
              Empowering Somali Students
              <br />
              <span className="bg-gradient-to-r from-[#5DB2B3] to-[#7ed3d4] text-transparent bg-clip-text">
                Through Knowledge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              KAAB HUB connects students with mentors, scholarships, and
              learning opportunities to create a brighter future for all.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-[#136269] px-10 py-4 rounded-full font-semibold hover:bg-[#5DB2B3] hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg"
            >
              Join Our Community
            </button>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#136269]/5 rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                KAAB HUB was born from a simple idea:{" "}
                <span className="font-medium text-[#136269]">
                  every student deserves a strong support system.
                </span>{" "}
                In Somalia, where students often lack access to reliable
                mentorship, guidance, and educational resources, we saw a chance
                to create something impactful.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                What started as a dream to connect curious learners with skilled
                locals has grown into a vibrant platform. Here, students ask
                real questions, mentors offer real support, and opportunity
                becomes a shared resource. We're not just a website — we're a
                movement.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#136269]/10 to-transparent p-8 rounded-2xl transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center">
                  <GlobeAltIcon className="h-10 w-10 text-[#136269] mb-4" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg text-center">
                  Global Reach
                </h3>
              </div>
              <div className="bg-gradient-to-br from-[#5DB2B3]/10 to-transparent p-8 rounded-2xl transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center">
                  <ChartBarIcon className="h-10 w-10 text-[#5DB2B3] mb-4" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg text-center">
                  Measurable Impact
                </h3>
              </div>
            </div>
            <div className="space-y-6 mt-12">
              <div className="bg-gradient-to-br from-[#5DB2B3]/10 to-transparent p-8 rounded-2xl transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center">
                  <LightBulbIcon className="h-10 w-10 text-[#5DB2B3] mb-4" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg text-center">
                  Innovation
                </h3>
              </div>
              <div className="bg-gradient-to-br from-[#136269]/10 to-transparent p-8 rounded-2xl transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center">
                  <UserGroupIcon className="h-10 w-10 text-[#136269] mb-4" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg text-center">
                  Community
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-[#136269]/5 to-transparent p-8 rounded-xl hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <HeartIcon className="h-12 w-12 text-[#136269] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Community Support
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We believe in the power of community and mutual support to help
                students succeed. Together, we can achieve more.
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#5DB2B3]/5 to-transparent p-8 rounded-xl hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <SparklesIcon className="h-12 w-12 text-[#5DB2B3] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Empowerment
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We empower students with knowledge, resources, and connections
                to achieve their goals and realize their full potential.
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#136269]/5 to-transparent p-8 rounded-xl hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <ArrowPathIcon className="h-12 w-12 text-[#136269] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Educational Equity
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                We're committed to breaking down barriers and creating equal
                opportunities for all students to access quality education.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What Our Community Says
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-6">
                <svg
                  className="h-8 w-8 text-[#5DB2B3] opacity-50"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                {testimonial.quote}
              </p>
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.author}
                </p>
                <p className="text-[#5DB2B3]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What We Do Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <QuestionMarkCircleIcon className="h-12 w-12 text-[#136269] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Questions & Answers
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Connect with peers and mentors to get help with academic
                challenges and career guidance. Our community is here to support
                your learning journey.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <UserIcon className="h-12 w-12 text-[#5DB2B3] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Mentorship
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Find experienced mentors who can guide you through your
                educational and professional journey. Get personalized advice
                and support.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center">
                <AcademicCapIcon className="h-12 w-12 text-[#136269] mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Opportunity Sharing
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Discover scholarships, internships, and other opportunities to
                advance your education and career. Stay informed about the
                latest opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#136269] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community Today</h2>
          <p className="text-xl text-[#5DB2B3] mb-12 max-w-2xl mx-auto">
            Be part of a growing community of students and mentors dedicated to
            educational excellence. Your journey starts here.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-[#136269] px-8 py-4 rounded-lg font-semibold hover:bg-[#5DB2B3] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/questions")}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#136269] transition-all duration-300 transform hover:scale-105"
            >
              Browse Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
