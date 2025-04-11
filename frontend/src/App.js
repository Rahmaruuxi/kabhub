import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import OpportunityDetail from "./pages/OpportunityDetail";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import ChatWidget from "./components/Chat/ChatWidget";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import CreateOpportunity from "./pages/CreateOpportunity";
import MentorshipPage from "./pages/MentorshipPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Opportunities from "./pages/Opportunities";
import Mentorships from "./pages/Mentorships";
import CreateMentorship from "./pages/CreateMentorship";
import MentorshipDetail from "./pages/MentorshipDetail";
import EditMentorship from "./pages/EditMentorship";
import Questions from "./pages/Questions";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Notifications from "./pages/Notifications";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import ScholarshipForm from "./pages/ScholarshipForm";
import EditOpportunity from "./pages/EditOpportunity";
import { SocketProvider } from "./context/SocketContext";

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/ask-question"
                  element={
                    <PrivateRoute>
                      <AskQuestion />
                    </PrivateRoute>
                  }
                />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route
                  path="/create-opportunity"
                  element={
                    <PrivateRoute>
                      <CreateOpportunity />
                    </PrivateRoute>
                  }
                />
                <Route path="/opportunity/:id" element={<OpportunityDetail />} />
                <Route
                  path="/edit-opportunity/:id"
                  element={
                    <PrivateRoute>
                      <EditOpportunity />
                    </PrivateRoute>
                  }
                />
                <Route path="/mentorships" element={<Mentorships />} />
                <Route
                  path="/create-mentorship"
                  element={
                    <PrivateRoute>
                      <CreateMentorship />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-mentorship/:id"
                  element={
                    <PrivateRoute>
                      <EditMentorship />
                    </PrivateRoute>
                  }
                />
                <Route path="/mentorship/:id" element={<MentorshipDetail />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/posts" element={<Posts />} />
                <Route
                  path="/create-post"
                  element={
                    <PrivateRoute>
                      <CreatePost />
                    </PrivateRoute>
                  }
                />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
                <Route path="/create-scholarship" element={<ScholarshipForm />} />
                <Route
                  path="/edit-scholarship/:id"
                  element={<ScholarshipForm />}
                />
              </Routes>
              <ChatWidget />
            </div>
          </ChatProvider>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
