import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import star from '../assets/star.png'
import Footer from './detail_footer'
import { useDarkMode } from '../Context/DarkModeContext'

export default function MovieList({ api_path }) {
  const [mediaType, setMediaType] = useState('movie') // 'movie' or 'tv'
  
  let actual_api_path = api_path
  if (mediaType === 'tv') {
    if (api_path === 'now_playing') actual_api_path = 'airing_today'
    if (api_path === 'upcoming') actual_api_path = 'on_the_air'
  }

  const [page, setPage] = useState(1)
  const [moviesList, setMoviesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedSort, setSelectedSort] = useState('popularity.desc')
  const [genres, setGenres] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [continueWatching, setContinueWatching] = useState([])

  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const API_KEY = import.meta.env.VITE_TMDB_KEY || import.meta.env.VITE_API_ID

  const titleMap = {
    now_playing: 'Now Playing',
    popular: 'Popular',
    top_rated: 'Top Rated',
    upcoming: 'Upcoming'
  }

  const title = titleMap[api_path] ?? api_path

  // Reset list, page, and filters when category or media type changes
  useEffect(() => {
    setMoviesList([])
    setPage(1)
    setSelectedGenre('')
    setSelectedSort('popularity.desc')
    setShowFilters(false)
  }, [actual_api_path, mediaType])

  // Load Continue Watching from localStorage
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('continue_watching') || '[]');
      setContinueWatching(list);
    } catch (e) {
      console.error("Error reading continue watching:", e);
    }
  }, [api_path]);

  // Fetch Genres when mediaType changes
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${API_KEY}&language=en-US`);
        if (res.ok) {
          const data = await res.json();
          setGenres(data.genres || []);
        }
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, [mediaType, API_KEY]);

  // Fetch Movies (Unified Category & Discover)
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const isDiscover = selectedGenre !== '' || selectedSort !== 'popularity.desc';
        let url = '';

        if (isDiscover) {
          url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&language=en-US&sort_by=${selectedSort}&with_genres=${selectedGenre}&page=${page}`;
        } else {
          url = `https://api.themoviedb.org/3/${mediaType}/${actual_api_path}?language=en-US&page=${page}&api_key=${API_KEY}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies");
        const json = await res.json();

        setTotalPages(json.total_pages || 1);
        if (page === 1) {
          setMoviesList(json.results || []);
        } else {
          setMoviesList(prev => [...prev, ...(json.results || [])]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [actual_api_path, mediaType, page, selectedGenre, selectedSort, API_KEY]);

  const handleGenreToggle = (genreId) => {
    setSelectedGenre(prev => (prev === genreId.toString() ? '' : genreId.toString()));
    setPage(1);
    setMoviesList([]);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setPage(1);
    setMoviesList([]);
  };

  const handleResetFilters = () => {
    setSelectedGenre('');
    setSelectedSort('popularity.desc');
    setPage(1);
    setMoviesList([]);
  };

  if (loading && page === 1 && moviesList.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-medium opacity-80">Loading Cinema...</p>
      </div>
    )
  }

  if (error && page === 1) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">{error}</div>
  }

  return (
    <div className={`min-h-screen py-16 px-6 transition-colors duration-500 ${darkMode ? 'bg-gray-950' : 'bg-[#fbfbfd]'}`}>
      <div className="max-w-7xl mx-auto animate-fade-in-stable">

        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className={`text-5xl md:text-6xl font-bold tracking-tighter transition-colors duration-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h1>
            <p className={`mt-3 text-lg font-medium opacity-80 transition-colors duration-500 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Experience the best in entertainment.
            </p>
            
            {/* Media Type Tabs */}
            <div className={`mt-6 flex flex-wrap items-center p-1 w-fit rounded-full transition-colors duration-500 ${darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-gray-200/50 border border-gray-300/50'}`}>
               <button 
                  onClick={() => setMediaType('movie')} 
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${mediaType === 'movie' ? (darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
               >
                  Movies
               </button>
               <button 
                  onClick={() => setMediaType('tv')} 
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${mediaType === 'tv' ? (darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
               >
                  TV Shows & Web Series
               </button>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer
                ${showFilters 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                  : (darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600' : 'bg-white border-gray-100 text-gray-700 hover:shadow-md')
                }
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Filters</span>
              {(selectedGenre !== '' || selectedSort !== 'popularity.desc') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              id="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`
                group relative flex items-center justify-between w-[100px] h-[44px] rounded-full border shadow-sm
                transition-all duration-500 active:scale-95 cursor-pointer
                ${darkMode
                  ? 'bg-gray-800/80 border-gray-700/50 hover:shadow-indigo-500/20 hover:border-indigo-500/30'
                  : 'bg-white/80 border-gray-200/50 hover:shadow-gray-300/30'
                }
              `}
            >
              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${darkMode ? 'from-indigo-500/10 to-transparent' : 'from-gray-100 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Sliding Background */}
              <div 
                className={`
                  absolute top-1 bottom-1 w-[44px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${darkMode ? 'left-[52px] bg-indigo-600 shadow-lg shadow-indigo-600/40' : 'left-1 bg-gray-900 shadow-lg shadow-gray-900/20'}
                `}
              />

              <div className="relative z-10 flex w-full justify-between items-center px-1">
                <div className={`w-[44px] h-full flex items-center justify-center transition-all duration-500 ${!darkMode ? 'scale-100' : 'scale-75 opacity-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-white'}`}>
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.757 17.834a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
                <div className={`w-[44px] h-full flex items-center justify-center transition-all duration-500 ${darkMode ? 'scale-100' : 'scale-75 opacity-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Watchlist Button */}
            <Link
              to="/watchlist"
              className={`
                group relative flex items-center gap-3 px-6 py-3 border shadow-sm rounded-2xl
                transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-95
                ${darkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                  : 'bg-white border-gray-100'
                }
              `}
            >
              <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-tr from-indigo-900/20 to-transparent' : 'bg-gradient-to-tr from-indigo-50 to-transparent'} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`} />
              <span className={`relative z-10 font-bold transition-colors ${darkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                My Watchlist
              </span>
              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 group-hover:bg-indigo-600 transition-colors duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </Link>
          </nav>
        </header>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className={`p-6 rounded-[2rem] border mb-12 transition-all duration-500 ${darkMode ? 'bg-gray-900/40 border-gray-800 text-gray-200' : 'bg-white border-gray-100 text-gray-800'}`}>
            <div className="flex flex-col gap-6">
              
              {/* Genre Selector */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-indigo-500">Select Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => {
                    const isSelected = selectedGenre === genre.id.toString();
                    return (
                      <button
                        key={genre.id}
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`
                          px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer border
                          ${isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                            : (darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-600')
                          }
                        `}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sorting and Actions Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-800/10 dark:border-gray-800">
                
                {/* Sort Option */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Sort By:</span>
                  <select
                    value={selectedSort}
                    onChange={handleSortChange}
                    className={`px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                  >
                    <option value="popularity.desc">Popularity Descending</option>
                    <option value="vote_average.desc">Rating Descending</option>
                    <option value="release_date.desc">Release Date Descending</option>
                  </select>
                </div>

                {/* Reset Action */}
                <button
                  onClick={handleResetFilters}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border ${darkMode ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-950/40' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100/70'}`}
                >
                  Reset All Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Continue Watching Section */}
        {continueWatching.length > 0 && api_path === 'now_playing' && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter mb-6">
              Continue <span className="text-indigo-500">Watching.</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
              {continueWatching.map((m) => {
                const poster = m.poster_path
                  ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
                  : 'https://via.placeholder.com/300x450?text=No+Poster';
                const routePath = m.media_type === 'tv' ? `/tv/${m.id}` : `/movie/${m.id}`;
                return (
                  <div
                    key={`${m.id}-${m.media_type}`}
                    onClick={() => navigate(routePath)}
                    className="min-w-[30%] sm:min-w-[20%] md:min-w-[15%] snap-start group cursor-pointer"
                  >
                    <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border transition-all duration-500 hover:shadow-lg hover:-translate-y-1.5 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                      <img src={poster} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      {/* Play overlay button */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <span className="text-black text-sm ml-0.5">▶</span>
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-[10px] md:text-sm font-bold truncate px-1 transition-colors ${darkMode ? 'group-hover:text-indigo-400 text-gray-200' : 'group-hover:text-indigo-600 text-gray-900'}`}>{m.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Movie Grid: 3 columns on mobile, responsive padding and aspect ratio */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-8">
          {moviesList.map((a, index) => {
            const poster = a.poster_path
              ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image'

            const overview =
              (a.overview || '').length > 100
                ? a.overview.slice(0, 100) + '...'
                : a.overview

            const displayTitle = a.title || a.name

            return (
              <div
                key={`${a.id}-${index}`}
                className={`
                  group relative rounded-2xl sm:rounded-[2rem] overflow-hidden cursor-pointer border
                  transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                  hover:-translate-y-2.5
                  ${darkMode
                    ? 'bg-gray-800 border-gray-700 hover:shadow-[0_22px_50px_-12px_rgba(99,102,241,0.25)]'
                    : 'bg-white border-gray-100 hover:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.15)]'
                  }
                `}
                onClick={() => navigate(`/${mediaType}/${a.id}`)}
              >
                {/* Poster Container using aspect-[2/3] */}
                <div className="overflow-hidden aspect-[2/3] relative">
                  <img
                    src={poster}
                    alt={displayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 backdrop-blur-md bg-black/30 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/10 sm:border-white/20">
                    <img src={star} alt="Star" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    <span className="text-white text-[9px] sm:text-xs font-bold">
                      {a.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Content - Compact on mobile */}
                <div className={`p-2.5 sm:p-6 transition-colors duration-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={`text-xs sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 truncate transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {displayTitle}
                  </h2>
                  <p className={`hidden sm:block text-sm leading-relaxed mb-6 h-10 overflow-hidden transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {overview}
                  </p>
                  <div className="hidden sm:flex items-center justify-between group/btn">
                    <span className="text-sm font-semibold text-indigo-500 group-hover/btn:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>

                {/* Glow Overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-[2rem] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-black/5" />
              </div>
            )
          })}
        </div>

        {/* Load More Button */}
        {totalPages > page && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className={`
                px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg'}
                ${darkMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/30' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}
              `}
            >
              {loading ? 'Loading...' : 'Load More Results'}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
