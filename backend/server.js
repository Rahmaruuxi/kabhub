const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const initializeSocket = require("./socket");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const mentorshipMessageRoutes = require("./routes/mentorshipMessageRoutes");
const postRoutes = require("./routes/postRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/student-forum")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/mentorship-messages", mentorshipMessageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Student Forum API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
