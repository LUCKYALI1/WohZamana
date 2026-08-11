import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "VITE_BACKEND_URL is not configured"
  );
}

const client = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
});

// ==================================================
// GET CLOUDINARY SIGNATURE
// ==================================================

export const getCloudinarySignature =
  async (type) => {
    try {
      const response =
        await client.get(
          `/api/cloudinary/signature?type=${type}`
        );

      return response.data;
    } catch (error) {
      console.error(
        "Cloudinary signature error:",
        error.response?.data || error
      );

      throw new Error(
        error.response?.data?.message ||
          "Could not prepare Cloudinary upload"
      );
    }
  };

// ==================================================
// DIRECT CLOUDINARY UPLOAD
// ==================================================

export const uploadToCloudinary =
  async (
    file,
    signatureData,
    resourceType
  ) => {
    const {
      signature,
      timestamp,
      folder,
      cloudName,
      apiKey,
    } = signatureData;

    const uploadUrl =
      `https://api.cloudinary.com/v1_1/` +
      `${cloudName}/${resourceType}/upload`;

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "api_key",
      apiKey
    );

    formData.append(
      "timestamp",
      timestamp
    );

    formData.append(
      "signature",
      signature
    );

    formData.append(
      "folder",
      folder
    );

    const response = await fetch(
      uploadUrl,
      {
        method: "POST",
        body: formData,
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      console.error(
        "Cloudinary upload error:",
        result
      );

      throw new Error(
        result?.error?.message ||
          "Cloudinary upload failed"
      );
    }

    return result;
  };

// ==================================================
// SAVE SONG TO DATABASE
// ==================================================

export const saveSong =
  async (songData) => {
    try {
      const response =
        await client.post(
          "/api/songs",
          songData
        );

      return response.data;
    } catch (error) {
      console.error(
        "Save song error:",
        error.response?.data || error
      );

      throw new Error(
        error.response?.data?.message ||
          "Could not save song"
      );
    }
  };

// ==================================================
// GET SONGS
// ==================================================

export const getSongs = async (
  page = 1,
  limit = 5
) => {
  try {
    const response =
      await client.get(
        `/api/songs?page=${page}&limit=${limit}`
      );

    return response.data;
  } catch (error) {
    console.error(
      "Get songs error:",
      error.response?.data || error
    );
  }
};

export default client;