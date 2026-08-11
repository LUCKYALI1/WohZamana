import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./db/db.config.js";
import { upload } from "./config/cloudinary.js";
import { Song } from "./models/Song.js";
import dns from "dns";
dotenv.config();

const app = express();
const server = createServer(app);

// --------------------------------------------------
// ENV
// --------------------------------------------------

dns.setServers(['8.8.8.8', '1.1.1.1']);
const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

// --------------------------------------------------
// CORS
// --------------------------------------------------

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// --------------------------------------------------
// BODY PARSER
// --------------------------------------------------

app.use(express.json());

// --------------------------------------------------
// BASIC ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Woh Zamana API is running 🚀",
  });
});

// --------------------------------------------------
// DB STATUS
// --------------------------------------------------

app.get("/api/db-status", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: "disconnected",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// GET SONGS
// --------------------------------------------------

app.get("/api/songs", async (req, res) => {
  try {
    // Make sure DB is connected
    await connectDB();

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 5, 1),
      50
    );

    const skip = (page - 1) * limit;

    const [totalSongs, songs] = await Promise.all([
      Song.countDocuments(),

      Song.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      songs,
      hasMore: skip + songs.length < totalSongs,
      totalSongs,
      page,
      limit,
    });
  } catch (error) {
    console.error("❌ Error fetching songs:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching songs",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// UPLOAD SONG
// --------------------------------------------------

app.post(
  "/api/songs/upload",

  upload.fields([
    {
      name: "audio",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    console.log("=================================");
    console.log("📥 UPLOAD REQUEST RECEIVED");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("=================================");

    try {
      await connectDB();

      const { title, artist, album } = req.body;

      if (!title || !artist) {
        return res.status(400).json({
          success: false,
          message: "Title and artist are required",
        });
      }

      if (
        !req.files ||
        !req.files.audio ||
        !req.files.cover
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both audio and cover image are required",
        });
      }

      const audioFile = req.files.audio[0];
      const coverFile = req.files.cover[0];

      console.log("🎵 Audio:", {
        name: audioFile.originalname,
        size: audioFile.size,
        type: audioFile.mimetype,
        path: audioFile.path,
      });

      console.log("🖼️ Cover:", {
        name: coverFile.originalname,
        size: coverFile.size,
        type: coverFile.mimetype,
        path: coverFile.path,
      });

      const newSong = await Song.create({
        title,
        artist,
        album: album || "Single",
        coverUrl: coverFile.path,
        audioUrl: audioFile.path,
      });

      console.log("✅ MongoDB song created:", newSong._id);

      io.emit("songAdded", newSong);

      return res.status(201).json({
        success: true,
        message: "Song uploaded successfully!",
        song: newSong,
      });

    } catch (error) {
      console.error("❌❌ UPLOAD ERROR ❌❌");
      console.error(error);
      console.error(error.stack);

      return res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },

  transports: ["polling", "websocket"],
});

// Online users
let onlineCount = 0;

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  onlineCount++;

  io.emit(
    "onlineCountUpdate",
    onlineCount
  );

  socket.on("disconnect", () => {
    console.log(
      "🔌 Socket disconnected:",
      socket.id
    );

    onlineCount = Math.max(
      0,
      onlineCount - 1
    );

    io.emit(
      "onlineCountUpdate",
      onlineCount
    );
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );

      console.log(
        `🌐 Frontend: ${FRONTEND_URL}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error
    );

    process.exit(1);
  }
};

startServer();