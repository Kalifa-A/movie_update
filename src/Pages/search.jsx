import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import star from '../assets/star.png'

export default function Search() {
  const [query, setQuery] = useState("") 
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_ID

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q")
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [location.search])

  const performSearch = async (searchTerm) => {
    try {
      setLoading(true)
      setError(null)
      // Only fetch search results here
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`
      )
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${query}`)
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 pb-20">
      {/* Search Bar Section */}
      <div className="bg-white/70 backdrop-blur-2xl border-b border-gray-100 py-16 mb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-gray-900">
            Explore <span className="text-indigo-600">Cinema.</span>
          </h1>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-8 py-6 text-xl rounded-[2rem] bg-gray-100/50 border-2 border-transparent focus:bg-white focus:border-indigo-500/20 outline-none transition-all duration-500 shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-indigo-600 font-bold">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((movie) => (
              <div 
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h2 className="font-bold text-gray-900 group-hover:text-indigo-600 truncate">{movie.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <img src={star} alt="star" className="w-3 h-3" />
                  <p className="text-sm text-gray-500">{movie.vote_average.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}