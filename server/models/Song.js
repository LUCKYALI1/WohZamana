import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "Single" },
    coverUrl: { type: String, required: true },
    audioUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);