import React, { useState, useEffect, useRef, useCallback } from "react";

import img from "../assets/bg.png";
import mobileImg from "../assets/mobile.jpg";

import Header from "../component/Header";
import AudioPlayer from "../ui/Player";

import { getRandomSongs } from "../api/Client.api";

const QUEUE_BATCH_SIZE = 5;
const REFILL_THRESHOLD = 2;

function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playlistRef = useRef([]);
  const isFetchingRef = useRef(false);
  const initializedRef = useRef(false);

  // ==================================================
  // KEEP QUEUE REF IN SYNC
  // ==================================================
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  // ==================================================
  // FETCH RANDOM SONGS
  // ==================================================
  const fetchRandomBatch = useCallback(async (count = QUEUE_BATCH_SIZE) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const excludeIds = playlistRef.current
        .map((song) => String(song._id || song.id))
        .filter(Boolean);

      const data = await getRandomSongs(count, excludeIds);
      const newSongs = Array.isArray(data) ? data : data?.songs || [];

      if (!newSongs.length) {
        console.log("ℹ️ Backend returned no new songs.");
        return;
      }

      setPlaylist((prev) => {
        const existingIds = new Set(
          prev.map((song) => String(song._id || song.id))
        );

        const uniqueSongs = newSongs.filter((song) => {
          const id = String(song._id || song.id);
          return !existingIds.has(id);
        });

        return [...prev, ...uniqueSongs];
      });
    } catch (error) {
      console.error("❌ Failed to fetch random songs:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // ==================================================
  // INITIAL QUEUE
  // ==================================================
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchRandomBatch(QUEUE_BATCH_SIZE);
  }, [fetchRandomBatch]);

  // ==================================================
  // AUTO REFILL QUEUE
  // ==================================================
  useEffect(() => {
    if (playlist.length === 0) return;

    const remaining = playlist.length - currentTrackIndex - 1;

    if (remaining <= REFILL_THRESHOLD && !isFetchingRef.current) {
      fetchRandomBatch(QUEUE_BATCH_SIZE);
    }
  }, [playlist.length, currentTrackIndex, fetchRandomBatch]);

  // ==================================================
  // NEXT & PREVIOUS
  // ==================================================
  const handleNext = useCallback(() => {
    if (playlistRef.current.length === 0) return;
    setCurrentTrackIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      return nextIndex >= playlistRef.current.length ? currentIndex : nextIndex;
    });
  }, []);

  const handlePrev = useCallback(() => {
    if (playlistRef.current.length === 0) return;
    setCurrentTrackIndex((currentIndex) =>
      currentIndex === 0 ? 0 : currentIndex - 1
    );
  }, []);

  const currentTrack = playlist[currentTrackIndex];

  // ==================================================
  // UI
  // ==================================================
  return (
    <main className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden select-none bg-black font-sans">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Khand:wght@700;800&display=swap');
        .font-hindi {
          font-family: 'Khand', sans-serif;
          font-weight: 800;
        }
      `}</style>

      {/* ==================================================
          OPTIMIZED & RESPONSIVE BACKGROUND IMAGE
      ================================================== */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Desktop Image Source (triggers download only on sm screens and up) */}
        <source media="(min-width: 640px)" srcSet={img} />
        
        {/* Mobile Default Fallback Image */}
        <img
          src={mobileImg}
          alt="2000s Bollywood nostalgia"
          className="w-full h-full object-cover object-center transform-gpu scale-100 transition-all duration-700 ease-out"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      {/* Dark Glass Overlay for better text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/10 to-black/40 pointer-events-none backdrop-blur-[1px]" />

      <Header />

      {/* ==================================================
          HERO CONTENT (Text positioned top on mobile, center on desktop)
      ================================================== */}
      <section
        className="
          relative z-10 w-full h-full
          flex flex-col items-center
          
          /* Mobile: Align top to show shop background */
          justify-start pt-[12vh] 
          
          /* Desktop: Align center */
          sm:justify-center sm:pt-0 

          px-5 sm:px-8 md:px-12 lg:px-20
          pb-24 sm:pb-28
          text-center
        "
      >
        <div className="w-full max-w-4xl flex flex-col items-center justify-center mx-auto">
          
          <p className="
            mb-2 sm:mb-4
            text-xs sm:text-sm md:text-base
            font-mono font-extrabold uppercase
            tracking-[0.2em] sm:tracking-[0.3em]
            text-rose-300
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
            whitespace-nowrap
          ">
            2000s • Bollywood • MP3 • Bluetooth
          </p>

          <h1 className="
            font-hindi
            text-[8rem] sm:text-7xl md:text-9xl lg:text-[10rem]
            tracking-tight
            leading-[0.8]
            text-white
            drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]
            whitespace-nowrap
          ">
            वो ज़माना
          </h1>

          <h2 className="
            mt-3 sm:mt-4
            text-1xl sm:text-2xl lg:text-3xl
            font-semibold uppercase
            tracking-wide sm:tracking-[0.1em]
            text-white/80
            drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]
          ">
            The Era We Never Forgot
          </h2>

          <p className="
            mt-2 sm:mt-4
            text-sm sm:text-lg lg:text-xl
            font-medium
            text-white/60
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
          ">
            Before streaming, we shared songs.
          </p>
        </div>
      </section>

      {/* ==================================================
          FOOTER / SOCIAL ICONS
      ================================================== */}
      <footer className="
        fixed bottom-6 left-1/2 -translate-x-1/2
        sm:left-8 sm:translate-x-0 lg:left-12
        z-50 flex items-center justify-center gap-3
      ">
        <a
          href="https://www.linkedin.com/in/luckyalim/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="
            flex items-center justify-center w-10 h-10 rounded-full
            bg-black/50 backdrop-blur-md border border-white/20
            text-white/80 shadow-lg transition-all duration-300
            hover:text-white hover:bg-black/80 hover:scale-105 active:scale-95
          "
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
          </svg>
        </a>

        <a
          href="mailto:luckyali786ashu@gmail.com"
          aria-label="Email"
          className="
            flex items-center justify-center w-10 h-10 rounded-full
            bg-black/50 backdrop-blur-md border border-white/20
            text-white/80 shadow-lg transition-all duration-300
            hover:text-white hover:bg-black/80 hover:scale-105 active:scale-95
          "
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </a>
      </footer>

      {/* ==================================================
          PLAYER / LOADING STATE
      ================================================== */}
      {currentTrack ? (
        <AudioPlayer
          key={currentTrack._id || currentTrack.id || currentTrackIndex}
          track={currentTrack}
          queueLength={playlist.length}
          currentIndex={currentTrackIndex}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      ) : (
        <div className="
          fixed bottom-6 right-6 z-30 flex items-center gap-2
          px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-md
          border border-white/10 shadow-xl
          text-white/80 text-sm font-mono tracking-wide
        ">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          Loading songs...
        </div>
      )}

    </main>
  );
}

export default React.memo(Home);