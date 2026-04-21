import React, { useState, useEffect, useRef } from 'react';

const SERVERS = [
  { id: 'vidsrc', label: 'Server 1', url: (id, t) => `https://vidsrc.to/embed/movie/${id}${t > 0 ? `?t=${t}` : ''}` },
  { id: 'embedsu', label: 'Server 2', url: (id, t) => `https://embed.su/embed/movie/${id}${t > 0 ? `?t=${t}` : ''}` },
];

export default function MoviePlayer({ tmdbId }) {
  const [server, setServer] = useState('vidsrc');
  const [currentTime, setCurrentTime] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    setIframeKey((k) => k + 1);
  }, [server, currentTime]);

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

  const currentServer = SERVERS.find((s) => s.id === server);
  const iframeSrc = currentServer.url(tmdbId, currentTime);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <MetaNoReferrer />

      {/* HEADER SECTION */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Cinematic <span className="text-indigo-500">Player</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Ultra HD Streaming Enabled</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* SERVER SELECTORS */}
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            {SERVERS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServer(s.id);
                  setCurrentTime(0);
                }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  server === s.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* FOCUS MODE */}
          <button
            onClick={handleFocusMode}
            className="group px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-800 transition-all active:scale-95 flex items-center gap-3"
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
      <div className="relative w-full max-w-6xl group">
        {/* Ambient Glow Backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <div 
          ref={playerContainerRef}
          onDoubleClick={toggleFullscreen}
          className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative bg-black group transition-transform duration-700"
        >
          {/* Subtle Glass Overlay (Non-blocking) */}
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
            className="absolute inset-0 w-full h-full border-0 z-0"
          />

          {/* FULLSCREEN TOAST (Appears on Hover) */}
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