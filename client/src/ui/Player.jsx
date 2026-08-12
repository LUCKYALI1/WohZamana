import React, { useState, useRef, useEffect, memo } from "react";

const DEFAULT_COVER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='16'>No Cover</text></svg>";

// ==================================================
// ICONS (BOLD VARIANTS)
// ==================================================

const PlayIcon = memo(() => (
  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
    <path d="M7 3.5v17l14-8.5z" />
  </svg>
));

const PauseIcon = memo(() => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M5 4h4.5v16H5zm9.5 0H19v16h-4.5z" />
  </svg>
));

const SkipBackIcon = memo(() => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M5 4h3v16H5zm3.5 8l10.5 8V4z" />
  </svg>
));

const SkipForwardIcon = memo(() => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M5 20l10.5-8L5 4v16zM16 4v16h3V4h-3z" />
  </svg>
));

const VolumeIcon = memo(({ isMuted, volume }) => {
  if (isMuted || volume === 0) {
    return (
      <svg className="w-4 h-4 fill-current text-white/80" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 fill-current text-white/80" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
});

// ==================================================
// PLAYER
// ==================================================

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

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const previousVolumeRef = useRef(1);

  const songSource = track?.audioUrl || track?.src || track?.url;
  const coverSource = track?.coverUrl || track?.cover || DEFAULT_COVER;

  // ==================================================
  // LOAD SONG
  // ==================================================

  useEffect(() => {
    if (!audioRef.current || !songSource) return;

    setHasError(false);
    setCurrentTime(0);
    setDuration(0);

    audioRef.current.src = songSource;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;

    const attemptPlay = async () => {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    attemptPlay();
  }, [songSource]);

  // ==================================================
  // PLAY / PAUSE
  // ==================================================

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // ==================================================
  // AUDIO EVENTS
  // ==================================================

  const handleAudioPlay = () => {
    setIsPlaying(true);

    if (onPlayStart) {
      onPlayStart();
    }
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioError = () => {
    console.error("Failed to load audio:", songSource);

    setHasError(true);
    setIsPlaying(false);
  };

  // ==================================================
  // SEEK & VOLUME HANDLERS
  // ==================================================

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }

    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      const restoredVal = previousVolumeRef.current || 1;
      setIsMuted(false);
      setVolume(restoredVal);
      audioRef.current.muted = false;
      audioRef.current.volume = restoredVal;
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
      setVolume(0);
      audioRef.current.muted = true;
      audioRef.current.volume = 0;
    }
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
   <div
  className="
    fixed
    z-40
    left-1/2
    -translate-x-1/2
    bottom-24
    w-[calc(100%-24px)]
    max-w-[380px]
    md:max-w-[620px]
    bg-gradient-to-b
    from-white/15
    to-black/30
    backdrop-blur-[3px]
    backdrop-saturate-180
    border
    border-white/20
    rounded-[28px]
    shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
    text-white
    select-none
    p-3
    md:p-3.5
  "
>
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

      <div className="flex items-center gap-3">
        {/* COVER ART */}
        <div className="w-[52px] h-[52px] md:w-[58px] md:h-[58px] shrink-0 rounded-xl overflow-hidden shadow-md">
          <img
            src={coverSource}
            alt={track?.title || "Track Cover"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_COVER;
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* SONG DETAILS + SEEKBAR */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-[14px] md:text-[15px] font-bold tracking-tight text-white truncate leading-snug">
            {track?.title || "Select a Track"}
          </h4>
          <p className="text-[12px] text-white/60 truncate leading-snug">
            {track?.artist || "Unknown Artist"}
          </p>

          {/* DESKTOP SEEKBAR (1-Row Design for Large Screens) */}
          <div className="hidden md:flex items-center gap-2 mt-1.5">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={hasError}
              className="
                w-full
                h-1
                bg-white/20
                rounded-full
                appearance-none
                cursor-pointer
                accent-white
                disabled:opacity-30
              "
            />
            <span className="text-[11px] font-medium text-white/70 tracking-wide shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* PREVIOUS */}
          <button
            onClick={onPrev}
            type="button"
            aria-label="Previous"
            className="p-1 text-white/80 hover:text-white transition-transform active:scale-90"
          >
            <SkipBackIcon />
          </button>

          {/* PLAY / PAUSE */}
          <button
            onClick={togglePlay}
            type="button"
            disabled={hasError}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="
              w-10
              h-10
              md:w-11
              md:h-11
              flex
              items-center
              justify-center
              bg-white
              text-black
              rounded-full
              shadow-md
              hover:scale-105
              active:scale-95
              transition-transform
              disabled:opacity-50
            "
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* NEXT */}
          <button
            onClick={onNext}
            type="button"
            aria-label="Next"
            className="p-1 text-white/80 hover:text-white transition-transform active:scale-90"
          >
            <SkipForwardIcon />
          </button>

          {/* VOLUME CONTROL */}
          <div className="flex items-center gap-1.5 ml-1 group">
            <button
              onClick={toggleMute}
              type="button"
              aria-label="Toggle Mute"
              className="p-1 hover:text-white transition-transform active:scale-90"
            >
              <VolumeIcon isMuted={isMuted} volume={volume} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="
                w-12
                sm:w-16
                h-1
                bg-white/20
                rounded-full
                appearance-none
                cursor-pointer
                accent-white
              "
            />
          </div>
        </div>
      </div>

      {/* MOBILE SEEKBAR (Stacked Row Design for Small Screens) */}
      <div className="flex md:hidden flex-col gap-1 mt-2.5 px-0.5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={hasError}
          className="
            w-full
            h-1
            bg-white/20
            rounded-full
            appearance-none
            cursor-pointer
            accent-white
            disabled:opacity-30
          "
        />
        <span className="text-[11px] font-medium text-white/70 tracking-wide">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

export default React.memo(AudioPlayer);