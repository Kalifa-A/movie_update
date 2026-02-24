import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import star from '../assets/star.png'
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
      'https://movie-backend-jet.vercel.app/api/watchlist', 
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
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 overflow-x-hidden">
      {/* Background Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {backdrop && (
          <>
            <img 
              src={backdrop} 
              alt="backdrop" 
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fbfbfd] via-transparent to-black/20" />
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
          
          {/* Floating Poster Card */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/20">
              <img src={poster} alt={movie.title} className="w-full h-auto" />
            </div>
          </div>

          {/* Details Glass Card */}
          <div className="flex-1 pt-10">
            <div className="backdrop-blur-xl bg-white/60 p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.genres?.map(g => (
                  <span key={g.id} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full tracking-widest uppercase">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
                {movie.title}
              </h1>

              <div className="flex items-center gap-6 mb-8 text-lg font-medium">
                <div className="flex items-center gap-2">
                  <img src={star} alt="star" className="w-5 h-5" />
                  <span>{movie.vote_average.toFixed(1)} <span className="text-gray-400 font-normal">/ 10</span></span>
                </div>
                <div className="h-4 w-[1px] bg-gray-300" />
                <span className="text-gray-600">{movie.runtime} min</span>
              </div>

              <h3 className="text-xl font-bold mb-3 text-gray-800">Overview</h3>
              <p className="text-gray-600 leading-relaxed text-xl font-light mb-10">{movie.overview}</p>

              {/* Cast Grid */}
              <h3 className="text-xl font-bold mb-6 text-gray-800">Top Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4 mb-10">
                {cast.map((person) => (
                  <div key={person.id} className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden shadow-md border-2 border-white transition-transform duration-500 group-hover:scale-110">
                      <img 
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200?text=N/A'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-gray-900 truncate">{person.name}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-1">
                  Watch Trailer
                </button>
                <button className="px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all hover:shadow-lg hover:-translate-y-1">
                  Add To Whishlist
                </button>
                {/* NEW WATCHLIST BUTTON */}
                <button 
                  disabled={isAdding}
                  onClick={addToWatchlist}
                  className={`px-8 py-4 font-bold rounded-2xl transition-all ${
                    isAdding ? 'bg-gray-200 text-gray-400' : 'bg-white/80 text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {isAdding ? "Adding..." : "+ Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED MOVIES SECTION */}
<div className="mt-20">
  <header className="mb-8">
    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
      Related <span className="text-indigo-600">Movies.</span>
    </h2>
  </header>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    {related.map((m) => {
      {/* FIXED URL CONSTRUCTION */}
      const relatedPoster = m.poster_path 
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';

      return (
        <div 
          key={m.id} 
          onClick={() => navigate(`/movie/${m.id}`)}
          className="group cursor-pointer"
        >
          <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <img 
              src={relatedPoster} 
              alt={m.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Liquid Overlay with Details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
              <div className="flex items-center gap-1 mb-2">
                 <img src={star} alt="rating" className="w-3 h-3" />
                 <span className="text-white text-xs font-bold">{m.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-white font-semibold text-xs">View Movie →</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors px-2">
            {m.title}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2">
            {new Date(m.release_date).getFullYear()}
          </p>
        </div>
      );
    })}
  </div>
</div>
      </div>
    </div>
  )

}
