import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import star from '../assets/star.png'

export default function Search() {
  const [query, setQuery] = useState("") 
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_ID

  // Debounced Suggestion Fetching
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsSuggesting(true)
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=en-US&page=1`
        )
        if (!res.ok) throw new Error("Suggestion fetch failed")
        const data = await res.json()
        // Limit to top 6 suggestions for a clean UI
        setSuggestions(data.results.slice(0, 6) || [])
        setShowSuggestions(true)
      } catch (err) {
        console.error("Suggestion error:", err)
      } finally {
        setIsSuggesting(false)
      }
    }

    const timer = setTimeout(() => {
      // Only fetch if query isn't already the search result (to avoid suggestions after full search)
      const params = new URLSearchParams(location.search)
      if (query !== params.get("q")) {
        fetchSuggestions()
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [query, API_KEY, location.search])

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
    setShowSuggestions(false)
    navigate(`/search?q=${query}`)
  }

  const handleSuggestionClick = (movieId) => {
    setShowSuggestions(false)
    navigate(`/movie/${movieId}`)
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
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-8 py-6 text-xl rounded-[2rem] bg-gray-100/50 border-2 border-transparent focus:bg-white focus:border-indigo-500/20 outline-none transition-all duration-500 shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
              Search
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 max-h-[450px] overflow-y-auto scrollbar-hide">
                  {isSuggesting ? (
                    <div className="p-8 text-center text-gray-400 font-medium animate-pulse">Searching for match...</div>
                  ) : (
                    <div className="space-y-2">
                       <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Top Suggestions</p>
                      {suggestions.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => handleSuggestionClick(movie.id)}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="w-12 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                            <img
                              src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "https://via.placeholder.com/200x300?text=NA"}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-xs">
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-gray-400">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                              </span>
                              <div className="h-2 w-[1px] bg-gray-200" />
                              <div className="flex items-center gap-1">
                                <img src={star} alt="star" className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-bold text-indigo-600/70">{movie.vote_average.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-indigo-600 text-sm">→</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Click backdrop to close suggestions */}
            {showSuggestions && (
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setShowSuggestions(false)}
              />
            )}
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
