import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    artist: {
      type: String,
      required: true,
      trim: true,
    },

    album: {
      type: String,
      default: "Single",
      trim: true,
    },

    coverUrl: {
      type: String,
      required: true,
    },

    audioUrl: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Song =
  mongoose.models.Song ||
  mongoose.model("Song", songSchema);