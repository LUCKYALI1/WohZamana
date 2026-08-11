import React, { useState, useRef, useEffect, memo } from "react";

const DEFAULT_COVER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='16'>No Cover</text></svg>";

const PlayIcon = memo(() => (
  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
));

const PauseIcon = memo(() => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
));

const SkipBackIcon = memo(() => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
));

const SkipForwardIcon = memo(() => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
));

function AudioPlayer({
  track,
  queueLength = 0,
  currentIndex = 0,
  onNext,
  onPrev,
  onPlayStart,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef(null);
  const songSource = track?.audioUrl || track?.src || track?.url;
  const coverSource = track?.coverUrl || track?.cover || DEFAULT_COVER;

  // Track change handler
  useEffect(() => {
    if (!audioRef.current || !songSource) return;

    setHasError(false);
    audioRef.current.src = songSource;
    audioRef.current.muted = false; // Hamesha unmuted rakhega
    setCurrentTime(0);

    // Unmuted sound ke saath play attempt karega
    const attemptPlay = async () => {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        // Agar browser autoplay block kare, toh mute nahi karega — bas play button click ka wait karega
        console.warn("Autoplay blocked by browser. User interaction required.");
        setIsPlaying(false);
      }
    };

    attemptPlay();
  }, [songSource]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;

    audioRef.current.muted = false;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback error:", err);
          setIsPlaying(false);
        });
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
    if (onPlayStart) onPlayStart();
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const handleAudioError = () => {
    console.error("Failed to load audio stream:", songSource);
    setHasError(true);
    setIsPlaying(false);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="absolute   bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 w-auto sm:w-[310px] md:w-[330px] bg-black/30 backdrop-blur-[2px] border border-white/5 p-4 rounded-3xl text-white shadow-2xl z-40 transition-all duration-300 select-none">
      <audio
        ref={audioRef}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleAudioError}
        onEnded={onNext}
        preload="auto"
      />

      {/* Track Details */}
      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
        <div className="w-14 h-14 sm:w-full sm:h-auto sm:aspect-square rounded-2xl overflow-hidden shadow-md border border-white/10 shrink-0 sm:mb-3">
          <img
            src={coverSource}
            alt={track?.title || "Track Cover"}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_COVER;
            }}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0 text-left sm:mb-3">
          <h4 className="text-sm font-semibold truncate leading-tight text-white">
            {track?.title || "Select a Track"}
          </h4>
          <p className="text-xs text-white/60 truncate mt-0.5 sm:mt-1 font-medium">
            {track?.artist || "Unknown Artist"}
          </p>
          {hasError && (
            <p className="text-[10px] text-red-400 font-mono mt-0.5">Stream Error</p>
          )}
        </div>
      </div>

      {/* Seekbar */}
      <div className="mb-2 sm:mb-3 mt-2 sm:mt-0">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={hasError}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Media Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={onPrev}
          type="button"
          aria-label="Previous Track"
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 touch-manipulation cursor-pointer"
        >
          <SkipBackIcon />
        </button>

        <button
          onClick={togglePlay}
          type="button"
          disabled={hasError}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 touch-manipulation cursor-pointer"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={onNext}
          type="button"
          aria-label="Next Track"
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 touch-manipulation cursor-pointer"
        >
          <SkipForwardIcon />
        </button>
      </div>
    </div>
  );
}

export default React.memo(AudioPlayer);