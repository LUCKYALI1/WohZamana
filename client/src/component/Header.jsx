import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';


const socket = io(
  import.meta.env.VITE_BACKEND_URL,
  {
    transports: ["polling", "websocket"],
    withCredentials: true,
  }
);
function Header() {
  const [time, setTime] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);

  // 1. Live Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real-Time Socket Connection Effect
  useEffect(() => {
    socket.on("onlineCountUpdate", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off("onlineCountUpdate");
    };
  }, []);
  useEffect(() => {
  const handleOnlineCount = (count) => {
    setOnlineCount(count);
  };

  socket.on(
    "onlineCountUpdate",
    handleOnlineCount
  );

  return () => {
    socket.off(
      "onlineCountUpdate",
      handleOnlineCount
    );
  };
}, []);

  return (
    <header className="fixed top-0 left-0 w-full px-6 py-4 flex items-center justify-between text-white z-20 font-mono text-sm select-none">
      {/* Live Clock */}
      <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        {time || '8:14 PM'}
      </div>

      {/* Online Counter (Real-time Updated) */}
      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs">{onlineCount} online</span>
      </div>

      {/* External Platforms */}
      <div className="flex items-center gap-2">
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs transition"
        >
          <span className="text-emerald-500 font-bold">●</span> Spotify
        </a>
        <a
          href="https://open.spotify.com/playlist/6iIQqnTZ1qjoPv6yTUStt0"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs transition"
        >
          <span className="text-red-500 font-bold">●</span> YT Music
        </a>
      </div>
    </header>
  );
}

export default React.memo(Header);