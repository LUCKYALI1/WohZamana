import React, { useState } from "react";
import { uploadSong } from "../api/Client.api";

function AdminUpload() {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Maximum file sizes
  const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setAudioFile(null);
      return;
    }

    // Check audio size
    if (file.size > MAX_AUDIO_SIZE) {
      setAudioFile(null);
      e.target.value = "";

      setMessage("❌ Audio file must be smaller than 10 MB.");
      return;
    }

    setAudioFile(file);
    setMessage("");
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setCoverFile(null);
      return;
    }

    // Check cover size
    if (file.size > MAX_COVER_SIZE) {
      setCoverFile(null);
      e.target.value = "";

      setMessage("❌ Cover image must be smaller than 5 MB.");
      return;
    }

    setCoverFile(file);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile || !coverFile) {
      setMessage("❌ Please select both audio and cover files.");
      return;
    }

    // Extra safety check before uploading
    if (audioFile.size > MAX_AUDIO_SIZE) {
      setMessage("❌ Audio file must be smaller than 10 MB.");
      return;
    }

    if (coverFile.size > MAX_COVER_SIZE) {
      setMessage("❌ Cover image must be smaller than 5 MB.");
      return;
    }

    setLoading(true);
    setMessage("");

    const data = new FormData();

    data.append("title", formData.title);
    data.append("artist", formData.artist);
    data.append("album", formData.album);
    data.append("audio", audioFile);
    data.append("cover", coverFile);

    try {
      await uploadSong(data);

      setMessage("🎉 Song uploaded successfully!");

      // Reset form
      setFormData({
        title: "",
        artist: "",
        album: "",
      });

      setAudioFile(null);
      setCoverFile(null);

      // Reset file inputs
      e.target.reset();
    } catch (error) {
      console.error("Upload error:", error);

      const errorMessage =
        error?.message ||
        error?.error ||
        "Server error during upload.";

      setMessage(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900/80 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl">

        <h2 className="text-2xl font-bold mb-6 text-rose-200 tracking-wide text-center">
          Admin - Upload Song
        </h2>

        {message && (
          <p className="mb-4 text-xs font-mono text-center p-3 rounded-xl bg-white/5 border border-white/10">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >

          {/* Song Title */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Song Title
            </label>

            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Bas Ek Sanam Chahiye"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Artist Name
            </label>

            <input
              type="text"
              name="artist"
              required
              value={formData.artist}
              onChange={handleChange}
              placeholder="e.g. Kumar Sanu"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Album */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Album Name (Optional)
            </label>

            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
              placeholder="e.g. Aashiqui (1990)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Cover */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Cover Image (JPG/PNG/WebP) — Max 5 MB
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleCoverChange}
              className="w-full text-xs text-white/70
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-xl
                file:border-0
                file:text-xs
                file:bg-white/10
                file:text-white
                hover:file:bg-white/20
                cursor-pointer"
            />
          </div>

          {/* Audio */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Audio File (MP3/WAV) — Max 10 MB
            </label>

            <input
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav"
              required
              onChange={handleAudioChange}
              className="w-full text-xs text-white/70
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-xl
                file:border-0
                file:text-xs
                file:bg-white/10
                file:text-white
                hover:file:bg-white/20
                cursor-pointer"
            />

            {audioFile && (
              <p className="mt-2 text-xs text-white/50">
                🎵 {audioFile.name} —{" "}
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Uploading to Cloud..."
              : "Upload Track"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminUpload;