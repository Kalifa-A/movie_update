import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import star from '../assets/star.png'

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([]) // New state for cast
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_KEY = import.meta.env.VITE_API_ID

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Fetch Movie Details and Credits (Cast) simultaneously
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`)
        ])

        if (!movieRes.ok || !creditsRes.ok) throw new Error('Failed to fetch movie data')

        const movieData = await movieRes.json()
        const creditsData = await creditsRes.json()

        setMovie(movieData)
        setCast(creditsData.cast.slice(0, 10)) // Get top 10 cast members
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMovieData()
  }, [id, API_KEY])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  )
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  const backdrop = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : null
  
  const poster = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : null

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

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Floating Poster Card */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/20 transition-transform duration-700 hover:scale-[1.02]">
              <img src={poster} alt={movie.title} className="w-full h-auto" />
            </div>
          </div>

          {/* Details Glass Card */}
          <div className="flex-1 pt-10">
            <div className="backdrop-blur-xl bg-white/60 p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.genres?.map(g => (
                  <span key={g.id} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
                {movie.title}
              </h1>

              <div className="flex items-center gap-6 mb-8 text-lg font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-2xl"><img src={star} alt="star" className="w-5 h-5" /></span>
                  <span>{movie.vote_average.toFixed(1)} <span className="text-gray-400 font-normal">/ 10</span></span>
                </div>
                <div className="h-4 w-[1px] bg-gray-300" />
                <span className="text-gray-600">{movie.runtime} min</span>
                <div className="h-4 w-[1px] bg-gray-300" />
                <span className="text-gray-600">{new Date(movie.release_date).getFullYear()}</span>
              </div>

              <h3 className="text-xl font-bold mb-3 text-gray-800">Overview</h3>
              <p className="text-gray-600 leading-relaxed text-xl font-light mb-10">
                {movie.overview}
              </p>

               {/* CAST SECTION */}
                    <h3 className="text-xl font-bold mb-6 text-gray-800">Top Cast</h3>

                    {/* Change: flex overflow to grid cols-2 (mobile) through cols-5 (desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4">
                      {cast.map((person) => (
                        <div key={person.id} className="text-center group">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden shadow-md border-2 border-white transition-transform duration-500 group-hover:scale-110 group-hover:shadow-xl">
                            <img 
                              src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200x200?text=N/A'} 
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs font-bold text-gray-900 truncate px-2">{person.name}</p>
                          <p className="text-[10px] text-gray-500 truncate px-2">{person.character}</p>
                        </div>
                      ))}
                    </div>
              

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-1">
                  Watch Trailer
                </button>
                <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pb-20" />
    </div>
  )
}