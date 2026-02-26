import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import star from '../assets/star.png'
import play from '../assets/play.png'
import axios from 'axios'


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
  console.log("Token being sent:", token); // If this is null, you aren't logged in!

  if (!token) {
    alert("Please login first!");
    navigate('/auth');
    return;
  }

  try {
    const movieData = {
      movieId: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average
    };

    const response = await axios.post(
      'http://localhost:5000/api/watchlist', 
      movieData, 
      {
        headers: { 'x-auth-token': token } 
      }
    );

    if (response.status === 201) {
      alert("Added to Watchlist!");
    }
  } catch (err) {
    console.log("Error Response:", err.response?.data);
    alert(err.response?.data?.message || "Error adding movie");
  }
  setIsAdding(false);
};
const getTrailer = async (id) => {
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
  <div className="min-h-screen bg-[#fbfbfd] text-gray-900 overflow-x-hidden font-sans">
    {/* Background Hero Section */}
    <div className="relative h-[65vh] w-full overflow-hidden">
      {backdrop && (
        <>
          <img 
            src={backdrop} 
            alt="backdrop" 
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbfbfd] via-transparent to-black/40" />
        </>
      )}
    </div>

    <div className="max-w-6xl mx-auto px-6 -mt-48 relative z-10 pb-20">
      <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
        
        {/* Floating Poster Card */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] border border-white/20">
            <img src={poster} alt={movie.title} className="w-full h-auto" />
          </div>
        </div>

        {/* Details Glass Card */}
        <div className="flex-1 pt-10">
          <div className="backdrop-blur-2xl bg-white/70 p-8 md:p-12 rounded-[3.5rem] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {movie.genres?.map(g => (
                <span key={g.id} className="px-4 py-1.5 bg-indigo-50/50 text-indigo-600 text-[10px] font-extrabold rounded-full tracking-widest uppercase border border-indigo-100/50">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 text-gray-900 leading-[1.1]">
              {movie.title}
            </h1>

            <div className="flex items-center gap-8 mb-10 text-lg font-semibold">
              <div className="flex items-center gap-2.5">
                <img src={star} alt="star" className="w-6 h-6" />
                <span>{movie.vote_average.toFixed(1)} <span className="text-gray-400 font-medium">/ 10</span></span>
              </div>
              <div className="h-5 w-[1px] bg-gray-300" />
              <span className="text-gray-600 font-medium">{movie.runtime} min</span>
              <div className="h-5 w-[1px] bg-gray-300" />
              <span className="text-gray-600 font-medium">{new Date(movie.release_date).getFullYear()}</span>
            </div>

            <h3 className="text-xl font-bold mb-4 text-gray-900">Overview</h3>
            <p className="text-gray-500 leading-relaxed text-xl font-medium mb-12 max-w-2xl">{movie.overview}</p>

            {/* Cast Grid */}
            <h3 className="text-xl font-bold mb-8 text-gray-900 tracking-tight">Top Cast</h3>
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
              {cast.map((person) => (
                <div key={person.id} className="text-center shrink-0 group">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden shadow-lg border-2 border-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-indigo-200">
                    <img 
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200?text=N/A'} 
                      className="w-full h-full object-cover"
                      alt={person.name}
                    />
                  </div>
                  <p className="text-[11px] font-bold text-gray-900 w-24 truncate">{person.name}</p>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS: Apple Style */}
            <div className="flex flex-wrap gap-5 mt-4">
              {/* Liquid Trailer Button */}
              <button 
  onClick={() => getTrailer(movie.id)}
  className="group flex items-center gap-4 px-8 py-5 
             /* Glassmorphism Base */
             bg-white/10 backdrop-blur-2xl border border-white/20 
             text-black font-bold rounded-[2.2rem] 
             /* Liquid Hover Effect */
             hover:bg-white hover:text-black hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]
             transition-all duration-500 active:scale-95 shadow-2xl"
>
  {/* The Play Icon Container */}
  <div className="w-10 h-10 flex items-center justify-center 
                  bg-transparent rounded-full overflow-hidden 
                  transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
    <img 
      src={play} 
      alt="play icon" 
      className="w-full h-full object-contain filter drop-shadow-md" 
    />
  </div>

  <span className="tracking-tight text-lg font-extrabold uppercase tracking-widest">
    Watch Trailer
  </span>
</button>

              {/* Watchlist Button */}
              <button 
  disabled={isAdding}
  onClick={addToWatchlist}
  className={`relative group px-10 py-5 font-extrabold rounded-[2.2rem] text-lg transition-all duration-500 active:scale-95 overflow-hidden
    ${isAdding 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
      : 'bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.5)] hover:-translate-y-1'
    }`}
>
  {/* The "Liquid" Shine Effect on Hover */}
  {!isAdding && (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
  )}

  <span className="relative flex items-center justify-center gap-2 tracking-tight">
    {isAdding ? (
      <>
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Adding...
      </>
    ) : (
      <>
        <span className="text-2xl font-light leading-none mb-1">+</span>
        Add to Watchlist
      </>
    )}
  </span>
</button>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED MOVIES SECTION */}
      <div className="mt-32">
        <header className="mb-12 flex items-center justify-between">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tighter">
            Related <span className="text-indigo-600">Movies.</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {related.map((m) => {
            const relatedPoster = m.poster_path 
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
              : 'https://via.placeholder.com/500x750?text=No+Image';

            return (
              <div 
                key={m.id} 
                onClick={() => {
                  navigate(`/movie/${m.id}`);
                  window.scrollTo(0, 0);
                }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden mb-5 shadow-sm border border-gray-100 transition-all duration-700 hover:shadow-[0_32px_64px_rgba(0,0,0,0.15)] hover:-translate-y-3">
                  <img 
                    src={relatedPoster} 
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="flex items-center gap-2 mb-3">
                       <img src={star} alt="rating" className="w-4 h-4" />
                       <span className="text-white text-sm font-bold">{m.vote_average.toFixed(1)}</span>
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">View Details →</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors px-2">
                  {m.title}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2 mt-1">
                  {new Date(m.release_date).getFullYear()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>

            {/* LIQUID APPLE PLAYER MODAL */}
{showModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
    {/* Frosted Glass Overlay */}
    <div 
      className="absolute inset-0 bg-[#fbfbfd]/85 backdrop-blur-3xl animate-fade-in"
      onClick={() => setShowModal(false)}
    />

    <div className="relative w-full max-w-6xl aspect-video group">
      
      {/* 1. THE DEEP SPREAD (Behind the player) */}
      <div className="absolute -inset-24 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
        <div className="absolute inset-[-100%] animate-siri-liquid" />
      </div>

      {/* 3. THE VIDEO PLAYER CONTAINER */}
      <div className="relative w-full h-full bg-black rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 z-10">
        
        {/* Apple Style Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent z-20 flex items-center justify-between px-10">
          <div className="flex items-center gap-3">
             <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </div>
             <span className="text-white/50 text-[10px] font-black tracking-[0.4em] uppercase italic">Liquid Cinema</span>
          </div>
          <button 
            onClick={() => setShowModal(false)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            ✕
          </button>
        </div>

        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0&color=white`}
          title="Liquid Intelligence Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  </div>
)}
  </div>
);
}
