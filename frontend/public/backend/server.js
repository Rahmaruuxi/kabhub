const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const postRoutes = require("./routes/postRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
app.use("/api/posts", postRoutes);
app.use("/api/scholarships", scholarshipRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Student Forum API" });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Join question room
  socket.on("join-question", (questionId) => {
    socket.join(`question-${questionId}`);
  });

  // Leave question room
  socket.on("leave-question", (questionId) => {
    socket.leave(`question-${questionId}`);
  });

  // Handle real-time notifications
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("leave", (userId) => {
    socket.leave(userId);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Make io accessible to routes
app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
