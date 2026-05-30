
import { useState, useRef, useEffect, useCallback } from 'react';

export interface AudioState {
  playing: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  muted: boolean;
  repeat: boolean;
  autoPlayNext: boolean;
}

export const useAudioPlayer = (src: string, onEnded?: () => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    playing: false,
    duration: 0,
    currentTime: 0,
    volume: 0.7,
    muted: false,
    repeat: false,
    autoPlayNext: true,
  });

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleLoadedMetadata = () => setState(s => ({ ...s, duration: audio.duration }));
    const handleTimeUpdate = () => setState(s => ({ ...s, currentTime: audio.currentTime }));
    const handlePlay = () => setState(s => ({ ...s, playing: true }));
    const handlePause = () => setState(s => ({ ...s, playing: false }));
    const handleEnded = () => {
      if (state.repeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (onEnded) {
        onEnded();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    audio.volume = state.volume;
    audio.muted = state.muted;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [src, onEnded, state.repeat]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (state.playing) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
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
      setState(s => ({ ...s, volume: vol }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const isMuted = !state.muted;
      audioRef.current.muted = isMuted;
      setState(s => ({ ...s, muted: isMuted }));
    }
  }, [state.muted]);

  const toggleRepeat = useCallback(() => {
    setState(s => ({ ...s, repeat: !s.repeat }));
  }, []);

  const toggleAutoPlayNext = useCallback(() => {
    setState(s => ({ ...s, autoPlayNext: !s.autoPlayNext }));
  }, []);

  return {
    ...state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleAutoPlayNext,
  };
};
