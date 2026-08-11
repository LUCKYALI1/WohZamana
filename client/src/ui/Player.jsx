import React, {
  useState,
  useRef,
  useEffect,
  memo,
} from "react";

const DEFAULT_COVER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%2318181b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='16'>No Cover</text></svg>";

const PlayIcon = memo(() => (
  <svg
    className="w-4 h-4 fill-current ml-0.5"
    viewBox="0 0 24 24"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
));

const PauseIcon = memo(() => (
  <svg
    className="w-4 h-4 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
));

const SkipBackIcon = memo(() => (
  <svg
    className="w-3.5 h-3.5 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
));

const SkipForwardIcon = memo(() => (
  <svg
    className="w-3.5 h-3.5 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
));

const VolumeIcon = memo(() => (
  <svg
    className="w-4 h-4 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.1-3.8v7.6a4.5 4.5 0 0 0 2.1-3.8z" />
  </svg>
));

const MuteIcon = memo(() => (
  <svg
    className="w-4 h-4 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M4.3 3L3 4.3 7.7 9H4v6h4l5 4v-4.7l4.7 4.7 1.3-1.3L4.3 3zM13 5l-2.1 1.7L13 8.8V5zm4.5 7a4.5 4.5 0 0 0-2.1-3.8v2.2l2.1 2.1V12z" />
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
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [hasError, setHasError] =
    useState(false);

  const [volume, setVolume] =
    useState(1);

  const [isMuted, setIsMuted] =
    useState(false);

  const audioRef = useRef(null);

  const previousVolumeRef = useRef(1);

  const songSource =
    track?.audioUrl ||
    track?.src ||
    track?.url;

  const coverSource =
    track?.coverUrl ||
    track?.cover ||
    DEFAULT_COVER;

  // ==================================================
  // LOAD NEW SONG
  // ==================================================

  useEffect(() => {
    if (!audioRef.current || !songSource) {
      return;
    }

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
      } catch (err) {
        console.warn(
          "Autoplay blocked by browser."
        );

        setIsPlaying(false);
      }
    };

    attemptPlay();
  }, [songSource]);

  // ==================================================
  // PLAY / PAUSE
  // ==================================================

  const togglePlay = () => {
    if (
      !audioRef.current ||
      hasError
    ) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();

      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error(
            "Playback error:",
            err
          );

          setIsPlaying(false);
        });
    }
  };

  // ==================================================
  // VOLUME
  // ==================================================

  const handleVolumeChange = (e) => {
    const newVolume =
      parseFloat(e.target.value);

    if (!audioRef.current) {
      return;
    }

    setVolume(newVolume);

    audioRef.current.volume =
      newVolume;

    if (newVolume > 0) {
      setIsMuted(false);
      audioRef.current.muted = false;

      previousVolumeRef.current =
        newVolume;
    }
  };

  // ==================================================
  // MUTE
  // ==================================================

  const toggleMute = () => {
    if (!audioRef.current) {
      return;
    }

    if (isMuted) {
      const restoredVolume =
        previousVolumeRef.current || 1;

      audioRef.current.muted = false;

      audioRef.current.volume =
        restoredVolume;

      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      previousVolumeRef.current =
        volume || 1;

      audioRef.current.muted = true;

      setIsMuted(true);
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
      setCurrentTime(
        audioRef.current.currentTime
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(
        audioRef.current.duration || 0
      );
    }
  };

  const handleAudioError = () => {
    console.error(
      "Failed to load audio stream:",
      songSource
    );

    setHasError(true);
    setIsPlaying(false);
  };

  // ==================================================
  // SEEK
  // ==================================================

  const handleSeek = (e) => {
    const newTime =
      parseFloat(e.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime =
        newTime;
    }

    setCurrentTime(newTime);
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (seconds) => {
    if (
      isNaN(seconds) ||
      seconds === 0
    ) {
      return "0:00";
    }

    const mins = Math.floor(
      seconds / 60
    );

    const secs = Math.floor(
      seconds % 60
    );

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed bottom-15 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl text-white shadow-2xl z-40 transition-all duration-300 select-none">

      <audio
        ref={audioRef}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onError={handleAudioError}
        onEnded={onNext}
        preload="auto"
      />

      <div className="flex items-center gap-3">

        {/* COVER */}

        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-white/10 shrink-0">
          <img
            src={coverSource}
            alt={
              track?.title ||
              "Track Cover"
            }
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                DEFAULT_COVER;
            }}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isPlaying
                ? "scale-105"
                : "scale-100"
            }`}
          />
        </div>

        {/* INFO */}

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">

          <div className="flex items-center justify-between gap-2">

            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold truncate leading-tight text-white">
                {track?.title ||
                  "Select a Track"}
              </h4>

              <p className="text-[11px] text-white/60 truncate font-medium">
                {track?.artist ||
                  "Unknown Artist"}
              </p>
            </div>

            <div className="text-[10px] font-mono text-white/50 shrink-0">
              {formatTime(currentTime)}
              {" / "}
              {formatTime(duration)}
            </div>

          </div>

          {/* SEEKBAR */}

          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={hasError}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
          />

        </div>

        {/* CONTROLS */}

        <div className="flex items-center gap-1 shrink-0">

          {/* PREVIOUS */}

          <button
            onClick={onPrev}
            type="button"
            aria-label="Previous Track"
            className="p-1.5 text-white/70 hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <SkipBackIcon />
          </button>

          {/* PLAY */}

          <button
            onClick={togglePlay}
            type="button"
            disabled={hasError}
            aria-label={
              isPlaying
                ? "Pause"
                : "Play"
            }
            className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          {/* NEXT */}

          <button
            onClick={onNext}
            type="button"
            aria-label="Next Track"
            className="p-1.5 text-white/70 hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <SkipForwardIcon />
          </button>

          {/* MUTE */}

          <button
            onClick={toggleMute}
            type="button"
            aria-label={
              isMuted
                ? "Unmute"
                : "Mute"
            }
            className="p-1.5 text-white/70 hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <MuteIcon />
            ) : (
              <VolumeIcon />
            )}
          </button>

          {/* VOLUME */}

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              isMuted
                ? 0
                : volume
            }
            onChange={
              handleVolumeChange
            }
            aria-label="Volume"
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />

        </div>
      </div>
    </div>
  );
}

export default React.memo(AudioPlayer);