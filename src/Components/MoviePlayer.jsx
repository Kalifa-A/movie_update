import React, { useState, useEffect, useRef } from 'react';

// Updated SERVERS with 5 dynamic secure streaming servers
const SERVERS = [
   { 
    id: 'vidsrc_pm', 
    label: 'Server 3 (VidSrc.pm)', 
    url: (id, type, t) => `https://vidsrc.pm/embed/${type}/${id}${t > 0 ? `?t=${t}` : ''}` 
  },

  { 
    id: 'vidsrc_me', 
    label: 'Server 2 (VidSrc.me)', 
    url: (id, type) => `https://vidsrc.me/embed/${type}/${id}` 
  },
  { 
    id: 'streamimdb', 
    label: 'Server 1 (StreamIMDb)', 
    url: (id, type) => `https://streamimdb.ru/embed/${type}/${id}` 
  },
];
export default function MoviePlayer({ tmdbId }) {
  const [server, setServer] = useState('vidsrc_pm');
  const [currentTime, setCurrentTime] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [imdbId, setImdbId] = useState(null);
  const [mediaType, setMediaType] = useState('movie'); // default to movie
  const [showDropdown, setShowDropdown] = useState(false);
  
  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const dropdownRef = useRef(null);

  const API_KEY = import.meta.env.VITE_API_ID;

  // Fetch External IDs and Media Info to get the real IMDb ID and Type
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}`);
        let data = await movieRes.json();
        let type = 'movie';

        if (data.success === false) {
           const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}`);
           data = await tvRes.json();
           type = 'tv';
        }

        setMediaType(type);

        // Fetch the IMDb ID specifically
        const idRes = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${API_KEY}`);
        const idData = await idRes.json();
        setImdbId(idData.imdb_id);
      } catch (err) {
        console.error("Error identifying media:", err);
      }
    };

    if (tmdbId) fetchMovieDetails();
  }, [tmdbId, API_KEY]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIframeKey((k) => k + 1);
  }, [server, currentTime, imdbId]);

  const handleFocusMode = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const currentServer = SERVERS.find((s) => s.id === server) || SERVERS[0];
  const activeId = server === 'streamimdb' ? imdbId : tmdbId;
  const iframeSrc = activeId ? currentServer.url(activeId, mediaType) : "";

  if (!activeId && server === 'streamimdb') return (
    <div className="aspect-video flex items-center justify-center bg-black rounded-[2rem]">
        <p className="text-zinc-500 animate-pulse text-xs font-black uppercase tracking-widest">Fetching Secure Server Link...</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto scrollbar-hide bg-[#050505] p-4 md:p-12 font-sans selection:bg-indigo-500/30">
      <MetaNoReferrer />

      {/* HEADER SECTION */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Cinematic <span className="text-indigo-500">Player</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                {mediaType === 'tv' ? 'Series' : 'Feature Film'} • Ultra HD Streaming Enabled
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          
          {/* Server Selector Dropdown */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-800 transition-all hover:bg-zinc-800 active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>{currentServer.label}</span>
              <svg xmlns="http://www.w3.org/2500/svg" className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Options List */}
            {showDropdown && (
              <div className="absolute left-0 mt-2 z-50 rounded-2xl bg-[#0d0d0d] border border-zinc-800/80 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                {SERVERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setServer(s.id);
                      setCurrentTime(0);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      server === s.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span>{s.label}</span>
                    {server === s.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="group px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-800 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
            Fullscreen
          </button>

          <button
            onClick={handleFocusMode}
            className="group px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-800 transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            Focus Mode
          </button>
        </div>
      </div>

      {/* PLAYER CONTAINER */}
      <div className="relative w-full max-w-6xl group animate-fade-in-stable">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <div 
          ref={playerContainerRef}
          onDoubleClick={toggleFullscreen}
          className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative bg-black group transition-transform duration-700"
        >
          <div className="absolute inset-0 z-10 pointer-events-none border-[1px] border-inset border-white/10 rounded-[2rem]"></div>

          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={iframeSrc}
            onLoad={handleFocusMode}
            title="Movie Player"
            frameBorder="0"
            allowFullScreen
            referrerPolicy="no-referrer"
            allow="autoplay; encrypted-media; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="absolute inset-0 w-full h-full border-0 z-0"
          />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 pointer-events-none hidden md:block">
            <div className="px-5 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 shadow-2xl">
              Double-click for Fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-8 flex items-center gap-6 opacity-40">
        <div className="h-[1px] w-12 bg-zinc-700" />
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500">Secure Encrypted Stream</p>
        <div className="h-[1px] w-12 bg-zinc-700" />
      </div>
    </div>
  );
}

function MetaNoReferrer() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="referrer"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'referrer';
      document.head.appendChild(meta);
    }
    meta.content = 'no-referrer';

    return () => {
      meta.content = 'strict-origin-when-cross-origin';
    };
  }, []);

  return null;
}