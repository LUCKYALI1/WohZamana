import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http"; // 👈 Added HTTP Server
import { Server } from "socket.io";   // 👈 Added Socket.io
import dns from "dns";
import { upload } from "./config/cloudinary.js";
import { Song } from "./models/Song.js";

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL.replace(/\/$/, "") ,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Create HTTP server wrapping Express
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes(origin.replace(/\/$/, "")),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Live Online Listener Counter
let onlineCount = 0;

io.on("connection", (socket) => {
  onlineCount++;
  // Broadcast updated count to all connected users
  io.emit("onlineCountUpdate", onlineCount);

  socket.on("disconnect", () => {
    onlineCount = Math.max(0, onlineCount - 1);
    io.emit("onlineCountUpdate", onlineCount);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// 1. Paginated Songs API
app.get("/api/songs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalSongs = await Song.countDocuments();
    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // console.log(`Fetched ${songs.length} songs for page ${page} with limit ${limit}. Total songs: ${totalSongs}`);

    res.status(200).json({
      songs,
      hasMore: skip + songs.length < totalSongs,
      totalSongs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs", error: error.message });
  }
});

// 2. Admin Upload Route
app.post(
  "/api/songs/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist, album } = req.body;

      if (!req.files || !req.files.audio || !req.files.cover) {
        return res.status(400).json({ message: "Both Audio and Cover image are required!" });
      }

      const audioUrl = req.files.audio[0].path;
      const coverUrl = req.files.cover[0].path;

      const newSong = await Song.create({
        title,
        artist,
        album: album || "Single",
        coverUrl,
        audioUrl,
      });

      res.status(201).json({ message: "Song uploaded successfully!", song: newSong });
    } catch (error) {
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  }
);

const PORT = process.env.PORT || 5000;
// NOTE: app.listen ki jagah server.listen use karein
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));