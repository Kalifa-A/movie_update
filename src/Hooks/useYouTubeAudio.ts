
import { useState, useRef, useEffect, useCallback } from 'react';

export interface YouTubePlayerState {
  playing: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  muted: boolean;
  repeat: boolean;
}


export const useYouTubeAudio = (videoId?: string, onEnded?: () => void) => {
  const playerRef = useRef<any>(null);
  const [state, setState] = useState<YouTubePlayerState>({
    playing: false,
    duration: 0,
    currentTime: 0,
    volume: 70,
    muted: false,
    repeat: false,
  });

  // Reset state when video changes
  useEffect(() => {
    setState(s => ({ ...s, currentTime: 0, duration: 0, playing: false }));
  }, [videoId]);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    const duration = event.target.getDuration();
    setState(s => ({ ...s, duration: isNaN(duration) ? 0 : duration }));
  };

  const onStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
    if (event.data === 1) {
      const duration = event.target.getDuration();
      setState(s => ({ 
        ...s, 
        playing: true, 
        duration: isNaN(duration) ? s.duration : duration 
      }));
    }
    else if (event.data === 2) setState(s => ({ ...s, playing: false }));
    else if (event.data === 0) {
      if (state.repeat) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      } else if (onEnded) {
        onEnded();
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && state.playing) {
        const current = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setState(s => ({ 
          ...s, 
          currentTime: isNaN(current) ? s.currentTime : current,
          duration: isNaN(dur) ? s.duration : dur
        }));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [state.playing]);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (state.playing) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    }
  }, [state.playing]);

  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(vol * 100);
      setState(s => ({ ...s, volume: vol * 100 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (state.muted) playerRef.current.unMute();
      else playerRef.current.mute();
      setState(s => ({ ...s, muted: !state.muted }));
    }
  }, [state.muted]);

  const toggleRepeat = useCallback(() => {
    setState(s => ({ ...s, repeat: !s.repeat }));
  }, []);

  return {
    ...state,
    onReady,
    onStateChange,
    togglePlay,
    seek,
    setVolume: (v: number) => setVolume(v),
    toggleMute,
    toggleRepeat,
  };
};
