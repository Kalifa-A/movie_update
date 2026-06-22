import { useState, useRef, useEffect, useCallback } from 'react';

export interface AudioPlayerState {
  playing: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  muted: boolean;
  repeat: boolean;
}

export const useSpotifyAudio = (audioUrl?: string, onEnded?: () => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    playing: false,
    duration: 30, // Spotify preview is commonly 30s
    currentTime: 0,
    volume: 70,
    muted: false,
    repeat: false,
  });

  useEffect(() => {
    setState(s => ({ ...s, currentTime: 0, playing: false }));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioUrl) {
         audioRef.current.src = audioUrl; // Ensure src is set before playing
         audioRef.current.load();
         const playPromise = audioRef.current.play();
         if (playPromise !== undefined) {
             playPromise.then(() => {
                 setState(s => ({ ...s, playing: true }));
             }).catch(e => {
                 console.log('Play prevented or failed:', e.name, e.message);
                 setState(s => ({ ...s, playing: false }));
             });
         }
      } else {
         audioRef.current.removeAttribute('src');
         audioRef.current.load();
      }
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setState(s => ({ ...s, currentTime: audio.currentTime, duration: audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity ? audio.duration : 30 }));
    };

    const handleEnded = () => {
      if (state.repeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (onEnded) {
        onEnded();
      } else {
        setState(s => ({ ...s, playing: false, currentTime: 0 }));
      }
    };

    const handlePlay = () => setState(s => ({ ...s, playing: true }));
    const handlePause = () => setState(s => ({ ...s, playing: false }));

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [state.repeat, onEnded]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (state.playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [state.playing]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setState(s => ({ ...s, volume: vol * 100 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !state.muted;
      setState(s => ({ ...s, muted: !state.muted }));
    }
  }, [state.muted]);

  const toggleRepeat = useCallback(() => {
    setState(s => ({ ...s, repeat: !s.repeat }));
  }, []);

  return {
    ...state,
    audioRef,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
  };
};
