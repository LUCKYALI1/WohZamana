import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import img from "../assets/bg.png";
import mobileImg from "../assets/mobile.png";
import Header from "../component/Header";
import AudioPlayer from "../ui/Player";

import { getRandomSongs } from "../api/Client.api";

const QUEUE_BATCH_SIZE = 5;
const REFILL_THRESHOLD = 2;

function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Always keep latest queue available to async functions
  const playlistRef = useRef([]);

  // Prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);

  // Prevent duplicate initial request
  const initializedRef = useRef(false);

  // --------------------------------------------------
  // KEEP REF IN SYNC WITH PLAYLIST
  // --------------------------------------------------

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  // --------------------------------------------------
  // FETCH RANDOM SONGS
  // --------------------------------------------------

  const fetchRandomBatch = useCallback(
    async (count = QUEUE_BATCH_SIZE) => {
      // Prevent duplicate requests
      if (isFetchingRef.current) {
        // console.log("⏳ Already fetching songs...");
        return;
      }

      isFetchingRef.current = true;

      try {
        // IDs already present in queue
        const excludeIds = playlistRef.current
          .map((song) => String(song._id || song.id))
          .filter(Boolean);

        // console.log("=================================");
        // console.log(`🎵 Fetching ${count} random songs`);
        // console.log("🚫 Excluding:", excludeIds);
        // console.log("=================================");

        const data = await getRandomSongs(
          count,
          excludeIds
        );

        const newSongs = Array.isArray(data)
          ? data
          : data?.songs || [];

        if (!newSongs.length) {
          console.log(
            "ℹ️ Backend returned no new songs."
          );

          return;
        }

        setPlaylist((prev) => {
          const existingIds = new Set(
            prev.map((song) =>
              String(song._id || song.id)
            )
          );

          const uniqueSongs = newSongs.filter((song) => {
            const id = String(
              song._id || song.id
            );

            return !existingIds.has(id);
          });

          if (!uniqueSongs.length) {
            // console.log(
            //   "ℹ️ All returned songs already exist."
            // );

            return prev;
          }

          // console.log(
          //   `✅ Adding ${uniqueSongs.length} songs`
          // );

          return [...prev, ...uniqueSongs];
        });
      } catch (error) {
        // console.error(
        //   "❌ Failed to fetch random songs:",
        //   error
        // );
      } finally {
        isFetchingRef.current = false;
      }
    },
    []
  );

  // --------------------------------------------------
  // INITIAL QUEUE
  // --------------------------------------------------

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    // console.log("🚀 Initial queue loading...");

    fetchRandomBatch(QUEUE_BATCH_SIZE);
  }, [fetchRandomBatch]);

  // --------------------------------------------------
  // AUTOMATIC QUEUE REFILL
  // --------------------------------------------------

  useEffect(() => {
    if (playlist.length === 0) {
      return;
    }

    const remaining =
      playlist.length -
      currentTrackIndex -
      1;

    // console.log(
    //   `🎧 Queue: ${playlist.length} | Current: ${currentTrackIndex} | Remaining: ${remaining}`
    // );

    // When 2 or fewer songs remain,
    // fetch 5 more in background.
    if (
      remaining <= REFILL_THRESHOLD &&
      !isFetchingRef.current
    ) {
      // console.log(
      //   "🔄 Queue low → fetching 5 more songs..."
      // );

      fetchRandomBatch(QUEUE_BATCH_SIZE);
    }
  }, [
    playlist.length,
    currentTrackIndex,
    fetchRandomBatch,
  ]);

  // --------------------------------------------------
  // NEXT
  // --------------------------------------------------

  const handleNext = useCallback(() => {
    if (playlistRef.current.length === 0) {
      return;
    }

    setCurrentTrackIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;

      // Don't go beyond currently loaded queue
      if (
        nextIndex >= playlistRef.current.length
      ) {
        // console.log(
        //   "⏳ No next song available yet..."
        // );

        return currentIndex;
      }

      return nextIndex;
    });
  }, []);

  // --------------------------------------------------
  // PREVIOUS
  // --------------------------------------------------

  const handlePrev = useCallback(() => {
    if (playlistRef.current.length === 0) {
      return;
    }

    setCurrentTrackIndex((currentIndex) => {
      // Already at first song
      if (currentIndex === 0) {
        return 0;
      }

      return currentIndex - 1;
    });
  }, []);

  // --------------------------------------------------
  // CURRENT SONG
  // --------------------------------------------------

  const currentTrack =
    playlist[currentTrackIndex];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="relative w-full h-screen min-h-screen overflow-hidden select-none bg-black">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap');

        .font-hindi {
          font-family: 'Tiro Devanagari Hindi', serif;
        }
      `}</style>

      {/* Hero Image */}

      <img
        src={img}
        alt="2000s Bollywood nostalgia"
        className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-1000"
        loading="eager"
        decoding="async"
      />

      {/* Glass Backdrop */}

      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-none" />

      {/* Header */}

      <Header />

      {/* Main Content */}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-20 lg:px-28 pb-28">

        <div className="max-w-3xl w-full flex flex-col items-center">

          <p className="mb-2 sm:mb-4 text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase text-rose-200 font-mono font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            2000s • BOLLYWOOD • MP3 • BLUETOOTH
          </p>

          <h1 className="font-hindi text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-wide leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            वो ज़माना
          </h1>

          <h2 className="mt-3 sm:mt-4 text-base sm:text-2xl md:text-3xl font-extrabold sm:font-bold tracking-[0.15em] sm:tracking-[0.25em] text-rose-100 drop-shadow-md">
            THE ERA WE NEVER FORGOT
          </h2>

          <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-white/90 tracking-wide font-medium max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Before streaming, we shared songs.
          </p>

          <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            A quiet thank you to{" "}
            <span className="font-bold text-rose-200">
              Emraan Hashmi
            </span>
            ,{" "}
            <span className="font-bold text-rose-200">
              KK
            </span>
            ,{" "}
            <span className="font-bold text-rose-200">
              Pritam
            </span>
            , and{" "}
            <span className="font-bold text-rose-200">
              Honey Singh
            </span>{" "}
            for crafting the soundtrack of our youth,
            making every late night walk, earphone
            sharing, and Bluetooth transfer unforgettable.
          </p>

        </div>
      </div>

      {/* Footer */}

      <footer className="fixed bottom-4 left-6 sm:left-12 md:left-20 lg:left-28 z-20 flex items-center gap-3 text-xs font-mono text-white/80">

        <a
          href="https://www.linkedin.com/in/luckyalim/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-rose-300 transition-colors bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg"
        >
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
          </svg>

          LinkedIn
        </a>

        <a
          href="mailto:luckyali786ashu@gmail.com"
          className="flex items-center gap-1.5 hover:text-rose-300 transition-colors bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg"
        >
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>

          luckyali786ashu@gmail.com
        </a>

      </footer>

      {/* PLAYER */}

      {currentTrack ? (
        <AudioPlayer
          key={
            currentTrack._id ||
            currentTrack.id ||
            currentTrackIndex
          }
          track={currentTrack}
          queueLength={playlist.length}
          currentIndex={currentTrackIndex}
          onNext={handleNext}
          onPrev={handlePrev}
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