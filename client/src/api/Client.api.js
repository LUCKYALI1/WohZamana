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

export const uploadSong = async (formData) => {
  try {
    const response = await client.post(
      "/api/songs/upload",
      formData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Upload API error:",
      error.response?.data || error
    );

    throw (
      error.response?.data ||
      new Error("Network Error")
    );
  }
};

export const getSongs = async (
  page = 1,
  limit = 5
) => {
  try {
    const response = await client.get(
      `/api/songs?page=${page}&limit=${limit}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get songs error:",
      error.response?.data || error
    );

    throw (
      error.response?.data ||
      new Error("Network Error")
    );
  }
};

export default client;