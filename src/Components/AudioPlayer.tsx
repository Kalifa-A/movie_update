
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '../Hooks/useAudioPlayer';
import { SoundtrackTrack } from '../services/soundtrackService';

interface AudioPlayerProps {
  track: SoundtrackTrack | null;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
  darkMode?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, onNext, onPrevious, className = '', darkMode = true }) => {
  const {
    playing,
    duration,
    currentTime,
    volume,
    muted,
    repeat,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
  } = useAudioPlayer(track?.audioUrl || '', onNext);

  useEffect(() => {
    // Auto play when track changes if track exists
    if (track && !playing) {
        // We might want auto-play, but browsers block non-user-initiated play
    }
  }, [track]);

  if (!track) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-2xl border transition-colors duration-500 ${
        darkMode ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white/80 border-gray-200 text-gray-900'
      } ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 flex-1 w-full overflow-hidden">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shrink-0">
            <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold truncate text-lg">{track.title}</h4>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{track.artist} - {track.album}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 w-full max-w-sm">
          <div className="flex items-center gap-6">
            <button onClick={toggleRepeat} aria-label="Toggle Repeat" className={`transition-colors ${repeat ? 'text-indigo-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button onClick={onPrevious} aria-label="Previous Track" className="hover:scale-110 active:scale-95 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button 
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all shadow-lg"
            >
              {playing ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button onClick={onNext} aria-label="Next Track" className="hover:scale-110 active:scale-95 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <div className="relative group">
                {/* Auto Play Icon/Toggle could go here */}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs font-bold w-10 text-right opacity-60">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1.5 bg-gray-200/20 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
            }}>
                <motion.div 
                    className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
            </div>
            <span className="text-xs font-bold w-10 opacity-60">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extra */}
        <div className="flex items-center gap-4 min-w-[120px] justify-end">
          <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="opacity-60 hover:opacity-100 transition-opacity">
            {muted || volume === 0 ? (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.41.31-.85.58-1.25.77v2.02c1-.26 1.91-.71 2.72-1.3l2.25 2.25L21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            ) : (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            )}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={muted ? 0 : volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume Control"
            className="w-20 accent-indigo-500 h-1 rounded-full bg-gray-200/20"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
