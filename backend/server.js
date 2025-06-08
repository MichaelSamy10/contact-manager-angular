const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

connectDB();

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running " });
});

// // Error handling middleware
// app.use(errorHandler);

// Socket.io connection handling
// handleSocketConnection(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
