const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const chatRoutes = require("./routes/chat.routes");
const conversationRoutes = require("./routes/conversation.routes");
const uploadRoutes = require("./routes/upload.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());


// Serve uploaded files statically
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// Register routes
app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/conversations", conversationRoutes);

app.use("/api/upload", uploadRoutes);


module.exports = app;