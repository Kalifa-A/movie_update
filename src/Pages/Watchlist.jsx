import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // We get the token inside the component
  const token = localStorage.getItem('token');

  useEffect(() => {
    // 1. If no token, kick them to login
    if (!token) {
      navigate('/auth');
      return;
    }

    // 2. If token exists, fetch THEIR movies
    const fetchWatchlist = async () => {
      try {
        const res = await axios.get('https://movie-backend-jet.vercel.app/api/watchlist', {
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
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchWatchlist();
  }, [token, navigate]);

  // --- UPDATED DELETE FUNCTION ---
  const handleRemove = async (e, movieId) => {
    e.stopPropagation(); 
    try {
      // Must send token for DELETE too!
      await axios.delete(`http://localhost:5000/api/watchlist/${movieId}`, {
        headers: { 'x-auth-token': token }
      });
      
      setMovies(movies.filter(m => m.movieId !== movieId));
    } catch (err) {
      console.error("Failed to remove movie:", err);
      alert("Error removing movie from watchlist");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="animate-pulse text-indigo-600 font-bold text-xl">Loading your collection...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight mb-12">
          Your <span className="text-indigo-600">Watchlist.</span>
        </h1>
        
        {movies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm">
            <p className="text-gray-400 text-xl font-light">Your watchlist is empty.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Discover Movies →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {movies.map((m) => (
              <div 
                key={m.movieId} 
                onClick={() => navigate(`/movie/${m.movieId}`)} 
                className="group relative cursor-pointer"
              >
                {/* FLOATING REMOVE BUTTON */}
                <button 
                  onClick={(e) => handleRemove(e, m.movieId)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={m.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="font-bold text-gray-900 truncate px-2 group-hover:text-indigo-600 transition-colors">
                  {m.title}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { Watchlist };
