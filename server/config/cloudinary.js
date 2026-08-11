import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith("audio");
    return {
      folder: isAudio ? "woh_zamana/audio" : "woh_zamana/covers",
      resource_type: isAudio ? "video" : "image", // Cloudinary treats audio as "video" resource type
      allowed_formats: isAudio ? ["mp3", "wav", "m4a"] : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

export const upload = multer({ storage });