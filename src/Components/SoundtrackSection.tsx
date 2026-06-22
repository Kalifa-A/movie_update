
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSoundtracks, SoundtrackTrack } from '../services/soundtrackService';
import SpotifyAudioPlayer from './SpotifyAudioPlayer';

interface SoundtrackSectionProps {
  movieTitle: string;
  year?: string;
  darkMode?: boolean;
}

const SoundtrackSection: React.FC<SoundtrackSectionProps> = ({ movieTitle, year, darkMode = true }) => {
  const [tracks, setTracks] = useState<SoundtrackTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const data = await getSoundtracks(movieTitle, year);
      setTracks(data);
      setLoading(false);
    };

    if (movieTitle) {
      fetchTracks();
    }
  }, [movieTitle, year]);

  const handleTrackSelect = (index: number) => {
    setActiveTrackIndex(index);
  };

  const handleNext = () => {
    if (activeTrackIndex !== null && activeTrackIndex < tracks.length - 1) {
      setActiveTrackIndex(activeTrackIndex + 1);
    } else if (activeTrackIndex === tracks.length - 1) {
      setActiveTrackIndex(0); // Loop back
    }
  };

  const handlePrevious = () => {
    if (activeTrackIndex !== null && activeTrackIndex > 0) {
      setActiveTrackIndex(activeTrackIndex - 1);
    }
  };

  if (!loading && tracks.length === 0) {
    return null; // Don't break the page if no soundtrack found
  }

  return (
    <div className="mt-20 md:mt-32">
      <header className="mb-12 flex items-center justify-between">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
          Songs & <span className="text-indigo-600">Soundtrack.</span>
        </h2>
        {tracks.length > 4 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border transition-all duration-300 ${
              darkMode ? 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white hover:border-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-900 hover:border-indigo-600'
            }`}
          >
            {expanded ? 'Collapse' : `View All (${tracks.length})`}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-28 rounded-4xl animate-pulse ${darkMode ? 'bg-gray-900/60' : 'bg-gray-100'}`} />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {(expanded ? tracks : tracks.slice(0, 4)).map((track, index) => (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handleTrackSelect(index)}
                className={`group relative flex items-center gap-4 p-5 rounded-[2.5rem] cursor-pointer border transition-all duration-500 hover:-translate-y-2 ${
                  activeTrackIndex === index 
                    ? 'bg-indigo-600/10 border-indigo-600/50 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.3)]' 
                    : (darkMode ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/80 hover:border-gray-700' : 'bg-white border-gray-100 hover:shadow-2xl hover:border-white')
                }`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl relative group-hover:scale-105 transition-transform duration-500">
                  <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                     <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  {activeTrackIndex === index && (
                      <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-4">
                            <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white" />
                            <motion.div animate={{ height: [14, 6, 14] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white" />
                            <motion.div animate={{ height: [10, 14, 10] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-white" />
                        </div>
                      </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className={`font-black truncate text-sm tracking-tight transition-colors ${activeTrackIndex === index ? 'text-indigo-500' : ''}`}>{track.title}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 opacity-50`}>
                    {track.artist}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <SpotifyAudioPlayer 
        track={activeTrackIndex !== null ? tracks[activeTrackIndex] : null} 
        onNext={handleNext}
        onPrevious={handlePrevious}
        darkMode={darkMode}
      />
    </div>
  );
};

export default SoundtrackSection;
