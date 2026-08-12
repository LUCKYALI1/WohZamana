import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

import ytMusic from "../assets/youtube.png";

function Header() {
  const [time, setTime] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);

  // ==================================================
  // LIVE CLOCK
  // ==================================================

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // SOCKET.IO
  // ==================================================

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      // console.error("❌ VITE_BACKEND_URL is missing");
      return;
    }

    // console.log("🔌 Socket URL:", backendUrl);

    const socket = io(backendUrl, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      // console.log("🟢 Socket connected:", socket.id);
    });

    const handleOnlineCount = (count) => {
      // console.log("👥 Online count:", count);
      setOnlineCount(count);
    };

    socket.on("onlineCountUpdate", handleOnlineCount);

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    return () => {
      socket.off("onlineCountUpdate", handleOnlineCount);
      socket.disconnect();
    };
  }, []);

  // ==================================================
  // UI
  // ==================================================

  return (
    <header
      className="
        fixed
        top-0
        left-0
        w-full
        px-4
        sm:px-6
        md:px-8
        py-3
        sm:py-4
        flex
        items-center
        justify-between
        text-white
        z-20
        font-mono
        text-sm
        select-none
      "
    >
      {/* LIVE CLOCK */}
      <div
        className="
          bg-black/30
          backdrop-blur-md
          px-3
          sm:px-3.5
          py-1.5
          rounded-full
          border
          border-white/10
          text-[10px]
          sm:text-xs
          font-semibold
          tracking-wide
          whitespace-nowrap
        "
      >
        {time || "8:14 PM"}
      </div>

      {/* ONLINE COUNTER */}
      <div
        className="
          flex
          items-center
          gap-1.5
          sm:gap-2
          bg-black/30
          backdrop-blur-md
          px-3
          sm:px-3.5
          py-1.5
          rounded-full
          border
          border-white/10
        "
      >
        <span className="relative flex h-2 w-2">
          <span
            className="
              animate-ping
              absolute
              inline-flex
              h-full
              w-full
              rounded-full
              bg-emerald-400
              opacity-75
            "
          />

          <span
            className="
              relative
              inline-flex
              rounded-full
              h-2
              w-2
              bg-emerald-500
            "
          />
        </span>

        <span
          className="
            text-[10px]
            sm:text-xs
            font-semibold
            tracking-wide
            whitespace-nowrap
          "
        >
          {onlineCount} online
        </span>
      </div>

      {/* YOUTUBE MUSIC */}
      <div className="flex items-center gap-2">
        <a
          href="https://music.youtube.com/playlist?list=PLC2QJJ63bR5A"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open YouTube Music"
          className="
            group
            flex
            items-center
            justify-center
            w-10
            h-10
            rounded-full
            bg-black/40
            hover:bg-black/60
            backdrop-blur-md
            border
            border-white/10
            transition-all
            duration-200
            hover:scale-110
            active:scale-95
            shadow-lg
          "
        >
          <img
            src={ytMusic}
            alt="YouTube Music"
            className="
              w-10
              h-10
              object-contain
              transition-transform
              duration-200
              group-hover:scale-110
            "
          />
        </a>
      </div>
    </header>
  );
}

export default React.memo(Header);