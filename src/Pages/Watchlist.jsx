import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './detail_footer';
import Video from '../assets/video-player.png';


export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Define API Base
  const API_BASE =import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const res = await axios.get(`${API_BASE}/watchlist`, {
          headers: { 'x-auth-token': token }
        });
        setMovies(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [token, navigate, API_BASE]);

  const handleDelete = async (movieId) => {
    try {
      await axios.delete(`${API_BASE}/watchlist/${movieId}`, {
        headers: { 'x-auth-token': token }
      });
      // Liquid Update: Filter out the movie immediately
      setMovies(prev => prev.filter(m => m.movieId !== movieId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="animate-pulse text-indigo-600 font-bold text-xl tracking-tighter uppercase italic">
          Liquid Library
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 font-sans pb-20 md:pb-10 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Collection Header */}
        <header className="mb-12 md:mb-20">
          <h1 className="text-5xl md:text-5xl font-black tracking-tighter text-gray-900 leading-none">
            Your <span className="text-indigo-600">Collection.</span>
          </h1>
          <p className="text-gray-400 mt-6 text-lg md:text-xl font-medium max-w-xl">
            A curated selection of your cinematic favorites, saved for whenever you're ready.
          </p>
        </header>

        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
            <div className="text-6xl mb-6 w-40 h-40"><img src={Video} alt="Video Player Icon" /></div>
                      <p className="text-gray-400 text-xl font-bold tracking-tight mb-8">No movies in your vault yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-12 py-5 bg-black text-white text-sm font-black uppercase tracking-[0.2em] rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95"
          >
            Explore Library
          </button>
          </div>
        ) : (
          /* RESPONSIVE GRID: 2 columns on mobile, auto-scaling on desktop */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
            {movies.map((m) => {
              // Construct poster path safely
              const posterUrl = m.poster?.startsWith('http') 
                ? m.poster 
                : `https://image.tmdb.org/t/p/w500${m.poster || m.poster_path}`;

              return (
                <div 
                  key={m.movieId} 
                  onClick={() => navigate(`/movie/${m.movieId}`)}
                  className="group relative cursor-pointer"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 transition-all duration-700 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] group-hover:-translate-y-3">
                    <img 
                      src={posterUrl} 
                      alt={m.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* LIQUID DELETE BUTTON (Top Right) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to details
                        handleDelete(m.movieId);
                      }}
                      className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/20 text-white rounded-full shadow-2xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 active:scale-75"
                    >
                      <span className="text-xl leading-none">✕</span>
                    </button>

                    {/* Desktop Hover Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:flex flex-col justify-end p-8">
                      <span className="text-white font-black text-xs tracking-widest uppercase">View Details →</span>
                    </div>
                  </div>

                  {/* Movie Title & Subtitle */}
                  <div className="mt-5 px-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase mt-1">
                      Saved Item
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
export { Watchlist };


