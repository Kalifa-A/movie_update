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

  // Landing Page Discovery States
  const [trendingToday, setTrendingToday] = useState([])
  const [trendingActors, setTrendingActors] = useState([])
  const [loadingDiscovery, setLoadingDiscovery] = useState(false)
  
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

  // Fetch Trending Content & Actors on Landing
  useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        setLoadingDiscovery(true)
        const [trendingRes, actorsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}`)
        ])

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json()
          setTrendingToday((trendingData.results || []).slice(0, 8))
        }

        if (actorsRes.ok) {
          const actorsData = await actorsRes.json()
          setTrendingActors((actorsData.results || []).slice(0, 6))
        }
      } catch (err) {
        console.error("Error fetching search discovery data:", err)
      } finally {
        setLoadingDiscovery(false)
      }
    }

    fetchDiscoveryData()
  }, [API_KEY])

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
      <div className={`relative z-50 backdrop-blur-2xl border-b py-16 mb-12 transition-colors duration-500 ${darkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 border-gray-100'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
            Explore <span className="text-indigo-600">Cinema.</span>
          </h1>
          <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.25em] mb-10 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Search movies, TV shows, or actors
          </p>

          <form onSubmit={handleSearch}>
            <div className="relative group">
              <input
               ref={playerSectionRef}
                type="text"
                placeholder="Search"
                value={query}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setResults([]);
                }}
                className={`w-full pl-6 pr-24 py-4 text-base md:pl-8 md:pr-36 md:py-6 md:text-xl rounded-[1.5rem] md:rounded-[2rem] border-2 border-transparent outline-none transition-all duration-500 shadow-sm ${darkMode ? 'bg-gray-800/50 focus:bg-gray-800 focus:border-indigo-500/30 text-white placeholder-gray-500' : 'bg-gray-100/50 focus:bg-white focus:border-indigo-500/20'}`}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-5 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-base font-bold hover:bg-indigo-700 transition-all active:scale-95">
                Search
              </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <div className={`absolute top-full left-0 right-0 mt-4 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
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
            </div>
          </form>
        </div>
      </div>

      {/* Results Grid / Landing Page Discovery */}
      {new URLSearchParams(location.search).get("q") ? (
        <div className="max-w-7xl mx-auto px-6 animate-fade-in-stable">
          {loading ? (
            <div className="flex justify-center py-20 animate-pulse text-indigo-600 font-bold">Loading...</div>
          ) : error ? (
            <div className="min-h-[200px] flex items-center justify-center text-red-500 font-medium">{error}</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-8">
              {results.map((movie) => {
                const isTV = movie.media_type === 'tv';
                const displayTitle = isTV ? movie.name : movie.title;
                const routePath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
                const voteAverage = movie.vote_average?.toFixed(1) || '0.0';

                return (
                  <div 
                    key={movie.id}
                    onClick={() => navigate(routePath)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl sm:rounded-[2rem] overflow-hidden mb-2 sm:mb-4 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-white/5">
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster"}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <h2 className={`font-bold truncate text-xs sm:text-base transition-colors ${darkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>{displayTitle}</h2>
                    <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <img src={star} alt="star" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <p className={`text-[10px] sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{voteAverage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-stable">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100 border border-gray-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-indigo-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">No Results Found</h2>
              <p className={`text-xs max-w-sm mb-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                We couldn't find any movies, TV shows, or actors matching "{query}". Try checking the spelling or search for another title.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Landing Page Discovery Layout when no query parameter is set */
        <div className="max-w-7xl mx-auto px-6 space-y-16 animate-fade-in-stable">
          {/* Quick Tags / Genres */}
          <div className="text-center">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Popular Genres</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Action', 'Comedy', 'Sci-Fi', 'Drama', 'Thriller', 'Animation', 'Horror'].map(genre => (
                <button
                  key={genre}
                  onClick={() => {
                    setQuery(genre);
                    navigate(`/search?q=${genre}`);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer border ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-indigo-500/30 text-gray-300' : 'bg-white border-gray-200 hover:border-indigo-500/20 text-gray-600'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Today Grid */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider">Trending Today</h2>
            </div>

            {loadingDiscovery ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className={`aspect-[2/3] rounded-[2rem] ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trendingToday.map((movie) => {
                  const isTV = movie.media_type === 'tv';
                  const displayTitle = isTV ? movie.name : movie.title;
                  const routePath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
                  const voteAverage = movie.vote_average?.toFixed(1) || '0.0';

                  return (
                    <div
                      key={movie.id}
                      onClick={() => navigate(routePath)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-white/5">
                        <img
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster"}
                          alt={displayTitle}
                          className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <p className="text-white text-[10px] font-black uppercase tracking-wider bg-indigo-600 px-2.5 py-1 rounded-full shadow-md">Watch Now</p>
                        </div>
                      </div>
                      <h3 className={`font-bold truncate text-sm transition-colors ${darkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                        {displayTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <img src={star} alt="star" className="w-3 h-3" />
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} font-bold`}>{voteAverage}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popular Actors Circular Grid */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider">Popular Actors</h2>
            </div>

            {loadingDiscovery ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-6 animate-pulse">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-3">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    <div className={`w-16 h-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                {trendingActors.map((actor) => (
                  <div
                    key={actor.id}
                    onClick={() => navigate(`/person/${actor.id}`)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 shadow-md">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className={`font-bold truncate w-full text-xs transition-colors group-hover:text-indigo-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {actor.name}
                    </h3>
                    <p className={`text-[9px] uppercase font-bold tracking-widest mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {actor.known_for_department || 'Acting'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
