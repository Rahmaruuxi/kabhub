import React, { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const sampleMentors = [
  {
    name: "Abdi Hassan",
    skill: "Web Development",
    intro: "Full-stack developer with 5 years of experience, passionate about teaching coding to beginners.",
    location: "Mogadishu",
    profilePicture: "https://via.placeholder.com/150"
  },
  {
    name: "Amina Omar",
    skill: "Traditional Handicrafts",
    intro: "Artisan specializing in traditional Somali crafts. Teaching weaving and pottery techniques.",
    location: "Hargeisa",
    profilePicture: "https://via.placeholder.com/150"
  },
  {
    name: "Mohamed Ali",
    skill: "Sustainable Farming",
    intro: "Expert in drought-resistant farming methods and local crop optimization.",
    location: "Kismayo",
    profilePicture: "https://via.placeholder.com/150"
  },
];

const MentorshipPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    skill: '',
    description: '',
    location: '',
    contact: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Intro Section */}
      <section className="py-16 px-4 text-center bg-[#136269] text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mentorship from Your Community
          </h1>
          <p className="text-xl md:text-2xl text-[#5DB2B3]">
            Skilled people from Somalia offering to share their knowledge
          </p>
        </div>
      </section>

      {/* Mentor Cards Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleMentors.map((mentor, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {mentor.profilePicture ? (
                    <img
                      src={mentor.profilePicture.startsWith('http') 
                        ? mentor.profilePicture 
                        : `http://localhost:5000${mentor.profilePicture}`}
                      alt={mentor.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-[#5DB2B3]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'http://localhost:5000/uploads/profiles/default.png';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#5DB2B3]">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-[#136269]">{mentor.name}</h3>
                </div>
                <div className="inline-block bg-[#5DB2B3] text-white px-3 py-1 rounded-full text-sm mb-3">
                  {mentor.skill}
                </div>
                <p className="text-gray-600 mb-4">{mentor.intro}</p>
                <div className="flex items-center text-gray-500 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {mentor.location}
                </div>
                <button className="w-full bg-[#136269] text-white py-2 rounded-lg hover:bg-[#5DB2B3] transition-colors duration-300">
                  Request Mentorship
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become a Mentor Form */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#136269] mb-8">
            Want to Share Your Skills?
          </h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="skill">Skill you can teach</label>
                <input
                  type="text"
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="description">Short description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="location">Location (or 'Online')</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="contact">Contact (email or phone)</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5DB2B3] focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#136269] text-white py-3 rounded-lg hover:bg-[#5DB2B3] transition-colors duration-300 font-semibold"
              >
                Offer Mentorship
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default MentorshipPage;