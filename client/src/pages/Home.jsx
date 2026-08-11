import React, { useState, useEffect, useRef, useCallback } from "react";
import img from "../assets/ff.png";
import Header from "../component/Header";
import AudioPlayer from "../ui/Player";
import { getSongs } from "../api/Client.api";

function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);
  const initialPrefetchTriggered = useRef(false);

  // Optimized Fetch Batch
  const fetchBatch = useCallback(async (page, limit = 10) => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    try {
      const data = await getSongs(page, limit);
      const newSongs = Array.isArray(data)
        ? data
        : data?.songs || data?.data || [];

      if (newSongs.length > 0) {
        setPlaylist((prev) => {
          const existingIds = new Set(prev.map((s) => String(s._id || s.id)));
          const filtered = newSongs.filter(
            (s) => !existingIds.has(String(s._id || s.id))
          );
          return [...prev, ...filtered];
        });
        pageRef.current = page;
      }

      if (data?.hasMore !== undefined) {
        hasMoreRef.current = Boolean(data.hasMore);
      } else if (newSongs.length < limit) {
        hasMoreRef.current = false;
      }
    } catch (err) {
      console.error("Failed to fetch song batch:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initial Fetch (First 10 Songs)
  useEffect(() => {
    fetchBatch(1, 10);
  }, [fetchBatch]);

  // Check and Prefetch Logic
  const checkAndPrefetch = useCallback(
    (nextIndex, currentLength) => {
      const remaining = currentLength - (nextIndex + 1);
      if (remaining <= 3 && hasMoreRef.current) {
        fetchBatch(pageRef.current + 1, 10);
      }
    },
    [fetchBatch]
  );

  // Trigger extra prefetch on first play
  const handlePlayStart = useCallback(() => {
    if (!initialPrefetchTriggered.current) {
      initialPrefetchTriggered.current = true;
      if (hasMoreRef.current) {
        fetchBatch(pageRef.current + 1, 10);
      }
    }
  }, [fetchBatch]);

  // Robust Next Track Logic
  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;

    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % playlist.length;
      checkAndPrefetch(nextIndex, playlist.length);
      return nextIndex;
    });
  }, [playlist.length, checkAndPrefetch]);

  // Robust Previous Track Logic
  const handlePrev = useCallback(() => {
    if (playlist.length === 0) return;

    setCurrentTrackIndex((prevIndex) => {
      return (prevIndex - 1 + playlist.length) % playlist.length;
    });
  }, [playlist.length]);

  return (
    <main className="relative w-full h-screen min-h-screen overflow-hidden select-none bg-black">
      {/* Cursive Font Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .font-cursive {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

      {/* Background Hero Image */}
      <img
        src={img}
        alt="2000s Bollywood nostalgia"
        className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 transition-transform duration-1000"
        loading="eager"
        decoding="async"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 backdrop-blur-[1px] pointer-events-none" />

      {/* Navigation Header */}
      <Header />

      {/* Hero Content Section */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 pb-32 sm:pb-0">
        <div className="max-w-3xl w-full flex flex-col items-start">
          <p className="mb-2 sm:mb-4 text-xs sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase text-rose-200/90 font-mono font-semibold sm:font-normal drop-shadow">
            2000s • BOLLYWOOD • MP3 • BLUETOOTH
          </p>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-wide leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            वो ज़माना
          </h1>

          <h2 className="mt-3 sm:mt-4 text-base sm:text-2xl md:text-3xl font-extrabold sm:font-bold tracking-[0.15em] sm:tracking-[0.25em] text-rose-100/90 drop-shadow-md">
            THE ERA WE NEVER FORGOT
          </h2>

          <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-white/90 sm:text-white/75 tracking-wide font-medium sm:font-light max-w-md drop-shadow">
            Before streaming, we shared songs.
          </p>

          {/* Tribute Paragraph */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base text-white/90 sm:text-white/80 font-medium sm:font-normal leading-relaxed max-w-lg bg-black/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-3.5 sm:p-0 rounded-2xl border border-white/10 sm:border-none shadow-lg sm:shadow-none">
            A quiet thank you to{" "}
            <span className="font-bold text-rose-200">Emraan Hashmi</span>,{" "}
            <span className="font-bold text-rose-200">KK</span>,{" "}
            <span className="font-bold text-rose-200">Pritam</span>, and{" "}
            <span className="font-bold text-rose-200">Honey Singh</span> for
            crafting the soundtrack of our youth , making every late night walk,
            earphone sharing, and Bluetooth transfer unforgettable.
          </p>
        </div>
      </div>

      {/* Bottom Footer Section: LinkedIn & Email */}
      <footer className="fixed bottom-4 left-6 sm:left-12 md:left-20 lg:left-28 z-20 flex items-center gap-4 text-xs font-mono text-white/70">
        <a
          href="https://www.linkedin.com/in/luckyalim/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-rose-300 transition-colors bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-md"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
          </svg>
          LinkedIn
        </a>

        <a
          href="mailto:luckyali786ashu@gmail.com"
          className="flex items-center gap-1.5 hover:text-rose-300 transition-colors bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-md"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          Luckyali786ashu@gmail.com
        </a>
      </footer>

      {/* Floating Audio Player */}
      {playlist.length > 0 ? (
        <AudioPlayer
          key={
            playlist[currentTrackIndex]?._id ||
            playlist[currentTrackIndex]?.id ||
            currentTrackIndex
          }
          track={playlist[currentTrackIndex]}
          queueLength={playlist.length}
          currentIndex={currentTrackIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onPlayStart={handlePlayStart}
        />
      ) : (
        <div className="fixed bottom-6 right-6 text-white/70 text-xs font-mono z-30 bg-black/60 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Loading songs...
        </div>
      )}
    </main>
  );
}

export default React.memo(Home);