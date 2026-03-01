import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import star from '../assets/star.png'
import play from '../assets/play.png'
import axios from 'axios'
import Footer from './detail_footer';


export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [related, setRelated] = useState([]) // New state for related movies
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdding, setIsAdding] = useState(false); // State to manage add-to-watchlist button
  const [trailerKey, setTrailerKey] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_KEY = import.meta.env.VITE_API_ID
const addToWatchlist = async () => {
  if (!movie || isAdding) return;
  const token = localStorage.getItem('token');

  if (!token) {
    alert("Please login first!");
    navigate('/auth');
    return;
  }

  // --- THE FIX STARTS HERE ---
  // This tells the app: "Use the live URL from Vercel, but if that's missing, use localhost"
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  setIsAdding(true);

  try {
    const movieData = {
      movieId: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average
    };

    const response = await axios.post(
      `${API_BASE}/watchlist`, // ✅ Changed from 'http://localhost:5000...'
      movieData, 
      {
        headers: { 'x-auth-token': token } 
      }
    );
  // --- THE FIX ENDS HERE ---

    if (response.status === 201) {
      alert("Added to Watchlist!");
    }
  } catch (err) {
    console.log("Error Response:", err.response?.data);
    alert(err.response?.data?.message || "Error adding movie");
  } finally {
    setIsAdding(false);
  }
};const getTrailer = async (id) => {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
    );
    // Look for a YouTube video labeled 'Trailer'
    const trailer = res.data.results.find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube"
    );
    if (trailer) {
      setTrailerKey(trailer.key);
      setShowModal(true);
    } else {
      alert("No trailer available for this title.");
    }
  } catch (err) {
    console.error("Error fetching trailer", err);
  }
};

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true)
        // Fetch Details, Credits, and Recommendations in one go
        const [movieRes, creditsRes, relatedRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`)
        ])

        if (!movieRes.ok) throw new Error('Failed to fetch data')

        const movieData = await movieRes.json()
        const creditsData = await creditsRes.json()
        const relatedData = await relatedRes.json()

        setMovie(movieData)
        setCast(creditsData.cast.slice(0, 10))
        setRelated(relatedData.results.slice(0, 4)) // Show top 4 recommendations
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMovieData()
    // Scroll to top when the movie ID changes
    window.scrollTo(0, 0)
  }, [id, API_KEY])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  )
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null

return (
  <div className="min-h-screen bg-[#fbfbfd] text-gray-900 overflow-x-hidden font-sans pb-20 md:pb-0">
    
    {/* 1. HERO BACKDROP SECTION */}
    <div className="relative h-[60vh] md:h-[65vh] w-full overflow-hidden">
      {backdrop && (
        <>
          <img
            src={backdrop}
            alt="backdrop"
            className="absolute inset-0 w-full h-full object-cover scale-110 md:scale-105 animate-slow-zoom"
          />
          {/* Mobile-optimized gradient bleed */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbfbfd] via-[#fbfbfd]/40 md:via-transparent to-black/40" />
        </>
      )}
    </div>

    {/* 2. MAIN CONTENT CONTAINER */}
    <div className="max-w-6xl mx-auto px-6 -mt-32 md:-mt-48 relative z-10">
      
      {/* MOVIE DETAILS SECTION */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-20">

        {/* Desktop-Only Floating Poster */}
        <div className="hidden md:block w-1/3 shrink-0">
          <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] border border-white/20">
            <img src={poster} alt={movie.title} className="w-full h-auto" />
          </div>
        </div>

        {/* DETAILS: Transparent on Mobile, Glass Card on Desktop */}
        <div className="flex-1 w-full pt-0 md:pt-10">
          <div className="md:backdrop-blur-2xl md:bg-white/70 p-0 md:p-12 rounded-[3.5rem] md:border md:border-white/40 md:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">

            {/* Genres */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
              {movie.genres?.map(g => (
                <span
                  key={g.id}
                  className="px-3 md:px-4 py-1.5 bg-indigo-50/50 text-indigo-600 text-[9px] md:text-[10px] font-extrabold rounded-full tracking-widest uppercase border border-indigo-100/50"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1]">
              {movie.title}
            </h1>

            {/* Stats */}
            <div className="flex items-center gap-4 md:gap-8 mb-10 text-sm md:text-lg font-semibold">
              <div className="flex items-center gap-2.5">
                <img src={star} alt="star" className="w-5 h-5 md:w-6 md:h-6" />
                <span>
                  {movie.vote_average.toFixed(1)}
                  <span className="text-gray-400 font-medium"> / 10</span>
                </span>
              </div>
              <div className="h-4 w-[1px] bg-gray-300" />
              <span>{movie.runtime} min</span>
              <div className="h-4 w-[1px] bg-gray-300" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>

            {/* Overview */}
            <h3 className="text-xl font-bold mb-4">Overview</h3>
            <p className="text-gray-500 leading-relaxed text-lg md:text-xl font-medium mb-12 max-w-2xl">
              {movie.overview}
            </p>
                        {/* TOP CAST SECTION: Horizontal Swipe */}
<div className="mb-12">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-xl font-bold tracking-tight">Top Cast</h3>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Swipe →</span>
  </div>
  
  <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
    {cast && cast.map((person) => (
      <div key={person.id} className="text-center shrink-0 group snap-start">
        {/* Avatar Circle */}
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md border-2 border-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-indigo-100 group-hover:border-indigo-50">
          <img 
            src={person.profile_path 
              ? `https://image.tmdb.org/t/p/w200${person.profile_path}` 
              : 'https://via.placeholder.com/200?text=N/A'} 
            className="w-full h-full object-cover"
            alt={person.name}
          />
        </div>
        
        {/* Name & Character */}
        <p className="text-[11px] font-black text-gray-900 w-24 truncate leading-tight">
          {person.name}
        </p>
        <p className="text-[9px] text-gray-400 font-bold truncate w-24 mt-1 uppercase tracking-tighter">
          {person.character}
        </p>
      </div>
    ))}
  </div>
</div>

            {/* DESKTOP-ONLY BUTTONS */}
            <div className="hidden md:flex items-center gap-5 mt-4">
              <button 
                onClick={() => getTrailer(movie.id)}
                className="group flex items-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-2xl border border-white/20 text-black font-bold rounded-[2.2rem] hover:bg-white transition-all duration-500 shadow-2xl active:scale-95"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full transition-transform duration-500 group-hover:rotate-[360deg]">
                  <img src={play} alt="play" className="w-full h-full object-contain" />
                </div>
                <span className="tracking-tight text-lg uppercase font-black">Watch Trailer</span>
              </button>

              <button 
                disabled={isAdding}
                onClick={addToWatchlist}
                className={`px-10 py-5 font-extrabold rounded-[2.2rem] text-lg transition-all active:scale-95 shadow-lg ${
                  isAdding ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isAdding ? "Adding..." : "+ Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-3xl border-t border-gray-100 flex gap-3 z-50 md:hidden">
        <button 
          onClick={() => getTrailer(movie.id)}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-bold active:scale-95"
        >
          <img src={play} className="w-5 h-5 invert" alt="play" /> Trailer
        </button>
        <button 
          onClick={addToWatchlist}
          disabled={isAdding}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95"
        >
          {isAdding ? "Adding..." : "+ Watchlist"}
        </button>
      </div>

      {/* RELATED MOVIES SECTION: Mobile Horizontal Scroll */}
      <div className="mt-12 md:mt-32">
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
            Related <span className="text-indigo-600">Movies.</span>
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Swipe →</span>
        </header>

        <div className="flex overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10 pb-10 scrollbar-hide snap-x snap-mandatory px-2 md:px-0">
          {related.map((m) => {
            const relatedPoster = m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image';

            return (
              <div
                key={m.id}
                onClick={() => {
                  navigate(`/movie/${m.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-w-[70%] sm:min-w-[40%] md:min-w-full snap-start group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-[2.2rem] md:rounded-[2.5rem] overflow-hidden mb-4 shadow-sm border border-gray-100 transition-all duration-700 hover:shadow-xl hover:-translate-y-3">
                  <img
                    src={relatedPoster}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg font-bold truncate px-2 group-hover:text-indigo-600 transition-colors">
                  {m.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 mt-1">
                  {new Date(m.release_date).getFullYear()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>

    {/* VIDEO MODAL */}
  {showModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
    {/* Ultra-Blur Backdrop */}
    <div
      className="absolute inset-0 bg-[#fbfbfd]/85 backdrop-blur-[40px]"
      onClick={() => setShowModal(false)}
    />

    <div className="relative w-full max-w-6xl aspect-video z-10 group">
      
      {/* --- SIRI LIQUID ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 -z-10 overflow-visible">
        {/* Primary Liquid Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-500/20 blur-[80px] rounded-full animate-siri-liquid" />
        {/* Secondary Liquid Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[100%] h-[100%] bg-green-500/20 blur-[100px] rounded-full animate-siri-liquid" style={{ animationDelay: '-2s' }} />
        {/* Tertiary Liquid Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/3 w-[80%] h-[80%] bg-blue-400/20 blur-[60px] rounded-full animate-siri-liquid" style={{ animationDelay: '-4s' }} />
      </div>

      {/* PLAYER CONTAINER */}
      <div className="relative w-full h-full bg-black rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20">
        
        {/* INTERNAL LIQUID BADGE */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
            Liquid <span className="text-white">Cinema</span>
          </span>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 active:scale-90"
        >
          <span className="text-xl">✕</span>
        </button>

        {/* Video Frame */}
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="relative z-10 w-full h-full border-0"
        />
      </div>

      {/* NOW PLAYING PILL */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full flex justify-center pb-4">
        <div className="px-6 py-2.5 bg-white/40 backdrop-blur-2xl border border-white/40 rounded-full shadow-lg flex items-center gap-3">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-600">
            Now Playing
          </span>
          <div className="h-3 w-[1px] bg-gray-300" />
          <span className="text-[11px] md:text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">
            {movie.title}
          </span>
        </div>
      </div>

    </div>
  </div>
)}
    <Footer />
  </div>
);
}





          
        

