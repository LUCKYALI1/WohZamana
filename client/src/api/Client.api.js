import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadSong = async (formData) => {
  try {
    const response = await client.post("/songs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// Paginated Fetch API
export const getSongs = async (page = 1, limit = 5) => {
  try {
    const response = await client.get(`/songs?page=${page}&limit=${limit}`);
    return response.data; // { songs: [...], hasMore: true/false }
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};