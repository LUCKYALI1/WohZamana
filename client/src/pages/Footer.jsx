import React from "react";
import logo from '../assets/favicon-32x32.png'
import youtube from  '../assets/youtube.png'

function Footer() {
  return (
    <footer className="w-full bg-[#1e0505]/80 backdrop-blur-[1px]text-left px-6 py-12 md:px-16 md:py-16 font-sans select-text relative z-20 shadow-[0_-10px_35px_rgba(185,28,28,0.2)]">
      <div className="max-w-5xl mx-auto">
        
        {/* ==================================================
            HEADER / LOGO SECTION
        ================================================== */}
        <div className="flex items-center gap-4 mb-6">
          {/* Circular Logo */}
          <div className="w-20 h-20 rounded-full  flex items-center justify-center ">
              <img src={logo} alt="Logo"  className="w-[20] h-[20]"/>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold font-hindi text-white/90 drop-shadow-md">
              वो ज़माना
            </h2>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-0.5">
              THE ERA WE NEVER FORGOT
            </p>
          </div>
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}
        <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-2xl mb-10 font-medium">
          2000s Bollywood songs, playing round the clock — the kind of MP3s we used to share over Bluetooth at the back of the classroom. Also known as the golden era of indie pop and film soundtracks.
        </p>

        {/* ==================================================
            ROTATIONS / PLAYLISTS
        ================================================== */}
        <div className="mb-10">
          <h3 className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/40 mb-5">
            ROTATIONS
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-12 max-w-md text-sm text-white/70 font-medium">
            <button className="text-left hover:text-white transition-colors">Bluetooth Hits</button>
            <button className="text-left hover:text-white transition-colors">Emraan Hashmi</button>
            <button className="text-left hover:text-white transition-colors">Himesh Reshammiya</button>
            <button className="text-left hover:text-white transition-colors">Yo Yo Honey Singh</button>
            <button className="text-left hover:text-white transition-colors">90s & 2000s Dard</button>
          </div>
        </div>

        {/* ==================================================
            EXTERNAL LINKS / BUTTONS
        ================================================== */}
        <div className="flex flex-wrap gap-4 mb-12">

          {/* YT Music Button */}
          <a
            href="https://music.youtube.com/playlist?list=PLC2QJJ63bR5A"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 transition-all text-sm text-white/80"
          >
          <img src={youtube} alt="YouTube" className="w-12 h-12" />
            YouTube Music
          </a>
        </div>

        {/* ==================================================
            DISCLAIMER & COPYRIGHT
        ================================================== */}
        <div className="space-y-4">
          <p className="text-[11px] text-white/40 leading-relaxed max-w-4xl">
            Audio plays through our backend API. Nothing is permanently hosted on this site, and all rights stay with the labels, composers, and performers. Song credits are put together from film soundtrack listings.
          </p>
          
          <p className="text-[11px] text-white/40">
            If you hold rights to anything here and want it taken off, email{" "}
            <a 
              href="mailto:luckyali786ashu@gmail.com" 
              className="text-white/60 hover:text-white underline decoration-white/30 underline-offset-2 transition-colors"
            >
              luckyali786ashu@gmail.com
            </a>{" "}
            and it comes down.
          </p>

          <p className="text-[10px] tracking-[0.2em] text-white/30 pt-4">
            © 2026 wozamana.netlify.dev
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;