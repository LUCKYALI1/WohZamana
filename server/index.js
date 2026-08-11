import dns from "dns";
import mongoose from "mongoose";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./db/db.config.js";
import cloudinary from "./config/cloudinary.js";
import { Song } from "./models/Song.js";

dotenv.config();

const app = express();
const server = createServer(app);

// ==================================================
// ALLOWED FRONTENDS
// ==================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://wohzamana.netlify.app",
];

// ==================================================
// CORS
// ==================================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin
    // Example: Postman / server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // console.log("❌ CORS blocked:", origin);

    return callback(
      new Error("Not allowed by CORS")
    );
  },

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

app.use(express.json());

// ==================================================
// BASIC ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Woh Zamana API is running 🚀",
  });
});

// ==================================================
// DATABASE STATUS
// ==================================================

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

// ==================================================
// CLOUDINARY SIGNATURE
// ==================================================

app.get(
  "/api/cloudinary/signature",
  async (req, res) => {
    try {
      const type =
        req.query.type === "image"
          ? "image"
          : "video";

      const folder =
        type === "image"
          ? "woh_zamana/covers"
          : "woh_zamana/audio";

      const timestamp = Math.round(
        Date.now() / 1000
      );

      const signature =
        cloudinary.utils.api_sign_request(
          {
            timestamp,
            folder,
          },
          process.env.CLOUDINARY_API_SECRET
        );

      res.status(200).json({
        success: true,
        signature,
        timestamp,
        folder,
        cloudName:
          process.env.CLOUDINARY_CLOUD_NAME,
        apiKey:
          process.env.CLOUDINARY_API_KEY,
      });
    } catch (error) {
      // console.error(
      //   "❌ Cloudinary signature error:",
      //   error
      // );

      res.status(500).json({
        success: false,
        message:
          "Could not generate Cloudinary signature",
      });
    }
  }
);

// ==================================================
// GET SONGS
// ==================================================
// ==================================================
// GET RANDOM SONGS FOR PLAY QUEUE
// ==================================================

app.get("/api/songs/random", async (req, res) => {
  try {
    await connectDB();

    const requestedCount = Math.min(
      Math.max(
        parseInt(req.query.count) || 5,
        1
      ),
      10
    );

    const excludeParam =
      req.query.exclude || "";

    const excludeIds = excludeParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) =>
        /^[0-9a-fA-F]{24}$/.test(id)
      );

    const excludeObjectIds =
      excludeIds.map(
        (id) =>
          new mongoose.Types.ObjectId(id)
      );

    const filter =
      excludeObjectIds.length > 0
        ? {
            _id: {
              $nin: excludeObjectIds,
            },
          }
        : {};

    // Important:
    // Don't ask MongoDB for more songs
    // than actually exist outside the queue.
    const availableCount =
      await Song.countDocuments(filter);

    const sampleSize = Math.min(
      requestedCount,
      availableCount
    );

    if (sampleSize === 0) {
      return res.status(200).json({
        success: true,
        songs: [],
      });
    }

    const songs = await Song.aggregate([
      {
        $match: filter,
      },
      {
        $sample: {
          size: sampleSize,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      songs,
    });
  } catch (error) {
    // console.error(
    //   "❌ Random songs error:",
    //   error
    // );

    return res.status(500).json({
      success: false,
      message: "Could not fetch random songs",
      error: error.message,
    });
  }
});
app.get("/api/songs", async (req, res) => {
  try {
    await connectDB();

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit) || 5,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    const [totalSongs, songs] =
      await Promise.all([
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
      hasMore:
        skip + songs.length < totalSongs,
      totalSongs,
      page,
      limit,
    });
  } catch (error) {
    console.error(
      "❌ Error fetching songs:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Error fetching songs",
      error: error.message,
    });
  }
});

// ==================================================
// SAVE SONG
// ==================================================
//
// IMPORTANT:
// This route receives ONLY URLs.
// Audio and image do NOT pass through Vercel.
//

app.post("/api/songs", async (req, res) => {
  try {
    await connectDB();

    const {
      title,
      artist,
      album,
      audioUrl,
      coverUrl,
    } = req.body;

    // Validate
    if (
      !title ||
      !artist ||
      !audioUrl ||
      !coverUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, artist, audioUrl and coverUrl are required",
      });
    }

    const newSong = await Song.create({
      title,
      artist,
      album: album || "Single",
      audioUrl,
      coverUrl,
    });

    // console.log(
    //   "✅ Song saved:",
    //   newSong._id
    // );

    // Notify connected users
    io.emit("songAdded", newSong);

    res.status(201).json({
      success: true,
      message: "Song saved successfully!",
      song: newSong,
    });
  } catch (error) {
    // console.error(
    //   "❌ Save song error:",
    //   error
    // );

    res.status(500).json({
      success: false,
      message: "Could not save song",
      error: error.message,
    });
  }
});

// ==================================================
// SOCKET.IO
// ==================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },

  transports: [
    "polling",
    "websocket",
  ],
});

let onlineCount = 0;

io.on("connection", (socket) => {
  // console.log(
  //   "🔌 Socket connected:",
  //   socket.id
  // );

  onlineCount++;

  io.emit(
    "onlineCountUpdate",
    onlineCount
  );

  socket.on("disconnect", () => {
    // console.log(
    //   "🔌 Socket disconnected:",
    //   socket.id
    // );

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

// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
  (err, req, res, next) => {
    // console.error(
    //   "❌ Server error:",
    //   err
    // );

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: err.message,
    });
  }
);

// ==================================================
// START SERVER
// ==================================================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      // console.log(
      //   `🚀 Server running on port ${PORT}`
      // );
    });
  } catch (error) {
    // console.error(
    //   "❌ Server startup failed:",
    //   error
    // );

    process.exit(1);
  }
};

startServer();