import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import star from '../assets/star.png'
import { useDarkMode } from '../Context/DarkModeContext'

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
  const { darkMode } = useDarkMode()
  const playerSectionRef = useRef(null)
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
          `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&language=en-US&page=1`
        )
        if (!res.ok) throw new Error("Suggestion fetch failed")
        const data = await res.json()
        const filtered = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person');
        // Limit to top 6 suggestions for a clean UI
        setSuggestions(filtered.slice(0, 6))
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
    const handleFocusEvent = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      playerSectionRef.current?.focus();
    };

    window.addEventListener("focus-search-input", handleFocusEvent);
    
    // Also focus on mount
    playerSectionRef.current?.focus();

    return () => {
      window.removeEventListener("focus-search-input", handleFocusEvent);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q")
    const type = params.get("type")
    const id = params.get("id")
    if (q) {
      setQuery(q)
      performSearch(q, type, id)
    }
  }, [location.search])

  const performSearch = async (searchTerm, type, personId = null) => {
    try {
      setLoading(true)
      setError(null)
      
      if (type === 'person' && personId) {
        const movies = await fetchMoviesByActorId(personId);
        setResults(movies);
      } else {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${searchTerm}&language=en-US&page=1`
        )
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        
        if (data.results && data.results.length > 0 && data.results[0].media_type === 'person') {
           const person = data.results[0];
           const movies = await fetchMoviesByActorId(person.id);
           setResults(movies);
        } else {
           const movies = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
           setResults(movies);
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoviesByActorId = async (actorId) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch actor movies");
      const data = await res.json();
      return data.cast.sort((a, b) => b.popularity - a.popularity);
    } catch (err) {
      console.error("Error fetching actor movies", err);
      return [];
    }
  };

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setShowSuggestions(false)
    const params = new URLSearchParams(location.search)
    if (params.get("q") === query && !params.get("type")) {
      performSearch(query)
    } else {
      navigate(`/search?q=${query}`)
    }
  }

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false)
    if (item.media_type === 'person') {
      navigate(`/search?q=${item.name}&type=person&id=${item.id}`)
    } else if (item.media_type === 'tv') {
      navigate(`/tv/${item.id}`)
    } else {
      navigate(`/movie/${item.id}`)
    }
  }

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-[#fbfbfd] text-gray-900'}`}>
      {/* Search Bar Section */}
      <div className={`backdrop-blur-2xl border-b py-16 mb-12 transition-colors duration-500 ${darkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 border-gray-100'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-8">
            Explore <span className="text-indigo-600">Cinema.</span>
          </h1>

          <form onSubmit={handleSearch} className="relative group">
            <input
             ref={playerSectionRef}
              type="text"
              placeholder="Search movies, TV shows, or actors..."
              value={query}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setResults([]);
              }}
              className={`w-full px-8 py-6 text-xl rounded-[2rem] border-2 border-transparent outline-none transition-all duration-500 shadow-sm ${darkMode ? 'bg-gray-800/50 focus:bg-gray-800 focus:border-indigo-500/30 text-white placeholder-gray-500' : 'bg-gray-100/50 focus:bg-white focus:border-indigo-500/20'}`}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
              Search
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <div className={`absolute top-full left-0 right-0 mt-4 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
                <div className="p-4 max-h-[450px] overflow-y-auto scrollbar-hide">
                  {isSuggesting ? (
                    <div className={`p-8 text-center font-medium animate-pulse ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Searching for match...</div>
                  ) : (
                    <div className="space-y-2">
                       <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Top Suggestions</p>
                      {suggestions.map((item) => {
                        const isPerson = item.media_type === 'person';
                        const isTV = item.media_type === 'tv';
                        const imagePath = isPerson ? item.profile_path : item.poster_path;
                        const title = isPerson ? item.name : (isTV ? item.name : item.title);
                        const dateField = isTV ? item.first_air_date : item.release_date;
                        const subtitle = isPerson ? item.known_for_department : (dateField ? new Date(dateField).getFullYear() : "N/A");

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSuggestionClick(item)}
                            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`w-12 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                              <img
                                src={imagePath ? `https://image.tmdb.org/t/p/w200${imagePath}` : "https://via.placeholder.com/200x300?text=NA"}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-bold truncate transition-colors uppercase tracking-tight text-xs ${darkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                                  {title}
                                </h3>
                                {isPerson && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 border border-indigo-200">
                                    Actor
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {subtitle}
                                </span>
                                {!isPerson && item.vote_average > 0 && (
                                  <>
                                    <div className={`h-2 w-[1px] ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />
                                    <div className="flex items-center gap-1">
                                      <img src={star} alt="star" className="w-2.5 h-2.5" />
                                      <span className="text-[10px] font-bold text-indigo-600/70">{item.vote_average.toFixed(1)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                              <span className="text-indigo-600 text-sm">→</span>
                            </div>
                          </div>
                        );
                      })}
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
            {results.map((movie) => {
              const isTV = movie.media_type === 'tv';
              const displayTitle = isTV ? movie.name : movie.title;
              const routePath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
              
              return (
              <div 
                key={movie.id}
                onClick={() => navigate(routePath)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750"}
                    alt={displayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h2 className={`font-bold truncate transition-colors ${darkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>{displayTitle}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <img src={star} alt="star" className="w-3 h-3" />
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{movie.vote_average.toFixed(1)}</p>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
