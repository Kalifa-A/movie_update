import React, { useState } from 'react';

export default function MoviePlayer({ tmdbId }) {
  const [server, setServer] = useState('vidsrc');

  const getSource = () => {
    if (server === 'embedsu') return `https://vidsrc.to/embed/movie/${tmdbId}`;
    return `https://vidsrc.to/embed/movie/${tmdbId}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-4 md:p-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-black text-white/90 tracking-tighter">
          Cinematic <span className="text-indigo-500">Player</span>
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setServer('vidsrc')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${server === 'vidsrc' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            Server 1
          </button>
          <button 
            onClick={() => setServer('embedsu')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${server === 'embedsu' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            Server 2
          </button>
        </div>
      </div>
      <div className="w-full max-w-6xl aspect-video rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 relative bg-black">
        <iframe
          src={getSource()}
          title="Movie Player"
          frameBorder="0"
          allowFullScreen
          referrerPolicy="origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
}
