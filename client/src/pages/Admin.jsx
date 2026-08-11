import React, { useState } from "react";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !coverFile) {
      alert("Please select both Audio and Cover files!");
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
      const res = await fetch("http://localhost:5000/api/songs/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("🎉 Song uploaded successfully!");
        setFormData({ title: "", artist: "", album: "" });
        setAudioFile(null);
        setCoverFile(null);
      } else {
        setMessage(`❌ Upload failed: ${result.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error during upload.");
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
          <p className="mb-4 text-xs font-mono text-center p-2 rounded bg-white/5 border border-white/10">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Song Title</label>
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

          <div>
            <label className="text-xs text-white/60 mb-1 block">Artist Name</label>
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

          <div>
            <label className="text-xs text-white/60 mb-1 block">Album Name (Optional)</label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
              placeholder="e.g. Aashiqui (1990)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Cover Image (JPG/PNG)</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Audio File (MP3)</label>
            <input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Uploading to Cloud..." : "Upload Track"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpload;