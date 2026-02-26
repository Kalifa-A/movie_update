import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_BASE}/watchlist`, {
          headers: { 'x-auth-token': token }
        });
        setMovies(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [token, navigate]);

  const handleDelete = async (movieId) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      await axios.delete(`${API_BASE}/watchlist/${movieId}`, {
        headers: { 'x-auth-token': token }
      });
      setMovies(prev => prev.filter(m => m.movieId !== movieId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="animate-pulse text-indigo-600 font-bold text-xl">Loading Library...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tighter mb-12">
          Your <span className="text-indigo-600">Collection.</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {movies.map((m) => {
            // IMAGE PATH LOGIC: Checks if it needs the TMDB prefix
            const posterUrl = m.poster?.startsWith('http') 
              ? m.poster 
              : `https://image.tmdb.org/t/p/w500${m.poster || m.poster_path}`;

            return (
              <div 
                key={m.movieId} 
                className="group relative bg-white rounded-[2.8rem] overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                onClick={() => navigate(`/movie/${m.movieId}`)}
              >
                {/* Movie Poster */}
                <div className="aspect-[2/3] overflow-hidden bg-gray-100">
                  <img 
                    src={posterUrl} 
                    alt={m.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'; }}
                  />
                </div>

                {/* LIQUID REMOVE BUTTON (No Trash Can) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m.movieId);
                  }}
                  className="absolute top-5 right-5 z-20 
                             w-10 h-10 flex items-center justify-center 
                             bg-black/20 backdrop-blur-xl border border-white/30 
                             text-white rounded-full shadow-2xl
                             transition-all duration-300 active:scale-75
                             md:opacity-0 md:group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Bottom Info Bar */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase mt-1">
                    Added to Library
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export {Watchlist};
