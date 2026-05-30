
/// <reference types="vite/client" />
import axios from 'axios';

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  videoId: string;
  fullUrl: string;
  artwork: string;
  duration: number;
  source: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getSoundtracks = async (title: string, year?: string): Promise<SoundtrackTrack[]> => {
  try {
    const response = await axios.get(`${API_BASE}/soundtrack`, {
      params: { title, year }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching soundtrack:', error);
    return [];
  }
};
