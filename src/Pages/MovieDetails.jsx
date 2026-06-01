import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import star from '../assets/star.png'
import play from '../assets/play.png'
import axios from 'axios'
import Footer from './detail_footer';
import { useDarkMode } from '../Context/DarkModeContext'
import { motion, AnimatePresence } from 'framer-motion'
import MoviePlayer from '../Components/MoviePlayer'
import SoundtrackSection from '../Components/SoundtrackSection'


export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [activeDownload, setActiveDownload] = useState(null)
  const { darkMode } = useDarkMode()
  const playerSectionRef = useRef(null)

  const isTV = location.pathname.startsWith('/tv/')
  const mediaType = isTV ? 'tv' : 'movie'

  const API_KEY = import.meta.env.VITE_TMDB_KEY

  // ─── Download providers per quality ───────────────────────────────────────
  const getDownloadLinks = (movie) => {
    const tmdbId = movie.id
    const imdbId = movie.imdb_id
    const slug = (isTV ? movie.name : movie.title)
      ?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const year = new Date(isTV ? movie.first_air_date : movie.release_date).getFullYear()

    return [
      {
        res: '2160p',
        label: 'Ultra HD',
        badge: '4K',
        size: '~12 GB',
        color: 'rose',
        badgeBg: darkMode ? 'bg-rose-900/60 text-rose-300' : 'bg-rose-100 text-rose-700',
        providers: [
          {
            name: 'YTS',
            url: `https://yts.mx/movies/${slug}-${year}`,
            icon: '🎬',
          },
          {
            name: 'MultiEmbed',
            url: `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`,
            icon: '▶',
          },
        ],
      },
      {
        res: '1080p',
        label: 'Full HD',
        badge: 'FHD',
        size: '~2.5 GB',
        color: 'indigo',
        badgeBg: darkMode ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
        providers: [
          {
            name: 'YTS',
            url: `https://yts.mx/movies/${slug}-${year}`,
            icon: '🎬',
          },
          {
            name: 'Torrentio',
            url: imdbId
              ? `https://torrentio.strem.fun/sort=qualitysize/stream/${mediaType}/${imdbId}.json`
              : `https://yts.mx/movies/${slug}-${year}`,
            icon: '⚡',
          },
        ],
      },
      {
        res: '720p',
        label: 'HD Ready',
        badge: 'HD',
        size: '~1.2 GB',
        color: 'blue',
        badgeBg: darkMode ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-700',
        providers: [
          {
            name: 'YTS',
            url: `https://yts.mx/movies/${slug}-${year}`,
            icon: '🎬',
          },
          {
            name: 'EZTV',
            url: imdbId
              ? `https://eztv.re/search/?q=${imdbId}`
              : `https://eztv.re/search/?q=${encodeURIComponent(isTV ? movie.name : movie.title)}`,
            icon: '📺',
          },
        ],
      },
      {
        res: '360p',
        label: 'Standard',
        badge: 'SD',
        size: '~450 MB',
        color: 'zinc',
        badgeBg: darkMode ? 'bg-zinc-700/60 text-zinc-300' : 'bg-zinc-200 text-zinc-600',
        providers: [
          {
            name: 'Internet Archive',
            url: `https://archive.org/search?query=${encodeURIComponent(isTV ? movie.name : movie.title)}`,
            icon: '📦',
          },
          {
            name: 'OpenSubtitles',
            url: imdbId
              ? `https://www.opensubtitles.org/en/search/imdbid-${imdbId.replace('tt', '')}`
              : `https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-${encodeURIComponent(isTV ? movie.name : movie.title)}`,
            icon: '💬',
          },
        ],
      },
    ]
  }

  const addToWatchlist = async () => {
    if (!movie || isAdding) return
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first!')
      navigate('/auth')
      return
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    setIsAdding(true)

    try {
      const movieData = {
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      }

      const response = await axios.post(`${API_BASE}/watchlist`, movieData, {
        headers: { 'x-auth-token': token },
      })

      if (response.status === 201) {
        alert('Added to Watchlist!')
      }
    } catch (err) {
      console.log('Error Response:', err.response?.data)
      alert(err.response?.data?.message || 'Error adding movie')
    } finally {
      setIsAdding(false)
    }
  }

  const getTrailer = async (id) => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`
      )
      const trailer = res.data.results.find(
        (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
      )
      if (trailer) {
        setTrailerKey(trailer.key)
        setShowModal(true)
      } else {
        alert('No trailer available for this title.')
      }
    } catch (err) {
      console.error('Error fetching trailer', err)
    }
  }

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true)
        const [movieRes, creditsRes, relatedRes, idsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/recommendations?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/external_ids?api_key=${API_KEY}`),
        ])

        if (!movieRes.ok) throw new Error('Failed to fetch data')

        const movieData = await movieRes.json()
        const creditsData = await creditsRes.json()
        const relatedData = await relatedRes.json()
        const idsData = await idsRes.json()

        setMovie({ ...movieData, imdb_id: idsData.imdb_id })
        setCast(creditsData.cast.slice(0, 10))
        setRelated(relatedData.results.slice(0, 4))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMovieData()
    window.scrollTo(0, 0)
  }, [id, API_KEY, mediaType])

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-950' : 'bg-[#fbfbfd]'
        }`}
      >
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    )

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  const downloadOptions = getDownloadLinks(movie)

  return (
    <div
      className={`min-h-screen overflow-x-hidden font-sans pb-20 md:pb-0 transition-colors duration-500 ${
        darkMode ? 'bg-gray-950 text-gray-100' : 'bg-[#fbfbfd] text-gray-900'
      }`}
    >
      {/* 1. HERO BACKDROP SECTION */}
      <div
        ref={playerSectionRef}
        className={`relative w-full overflow-hidden bg-black transition-all duration-700 ${
          showPlayer ? 'h-[100vh]' : 'h-[60vh] md:h-[65vh]'
        }`}
      >
        <AnimatePresence mode="wait">
          {showPlayer ? (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full z-20 bg-black pt-16 pb-8 px-4"
            >
              <MoviePlayer tmdbId={movie.id} />
            </motion.div>
          ) : (
            backdrop && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={backdrop}
                  alt="backdrop"
                  className="absolute inset-0 w-full h-full object-cover scale-110 md:scale-105 animate-slow-zoom"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    darkMode
                      ? 'from-gray-950 via-gray-950/40'
                      : 'from-[#fbfbfd] via-[#fbfbfd]/40'
                  } to-black/40`}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div
        className={`max-w-6xl mx-auto px-6 relative z-10 transition-all duration-700 ${
          showPlayer ? 'mt-8 md:mt-12' : '-mt-32 md:-mt-48'
        }`}
      >
        {/* MOVIE DETAILS SECTION */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-20">
          {/* Desktop-Only Floating Poster */}
          <div className="hidden md:block w-1/3 shrink-0">
            <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.35)] border border-white/20">
              <img src={poster} alt={isTV ? movie.name : movie.title} className="w-full h-auto" />
            </div>
          </div>

          {/* DETAILS PANEL */}
          <div className="flex-1 w-full pt-0 md:pt-10">
            <div
              className={`md:backdrop-blur-2xl p-0 md:p-12 rounded-[3.5rem] md:border md:shadow-[0_8px_32px_rgba(0,0,0,0.04)] ${
                darkMode
                  ? 'md:bg-gray-800/70 md:border-gray-700/40'
                  : 'md:bg-white/70 md:border-white/40'
              }`}
            >
              {/* Genres */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className={`px-3 md:px-4 py-1.5 text-[9px] md:text-[10px] font-extrabold rounded-full tracking-widest uppercase border ${
                      darkMode
                        ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800/50'
                        : 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50'
                    }`}
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1]">
                {isTV ? movie.name : movie.title}
              </h1>

              {/* Stats */}
              <div className="flex items-center gap-4 md:gap-8 mb-10 text-sm md:text-lg font-semibold">
                <div className="flex items-center gap-2.5">
                  <img src={star} alt="star" className="w-5 h-5 md:w-6 md:h-6" />
                  <span>
                    {movie.vote_average.toFixed(1)}
                    <span className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {' '}
                      / 10
                    </span>
                  </span>
                </div>
                <div className={`h-4 w-[1px] ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <span>
                  {isTV ? movie.episode_run_time?.[0] || 'N/A' : movie.runtime} min
                </span>
                <div className={`h-4 w-[1px] ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <span>
                  {new Date(isTV ? movie.first_air_date : movie.release_date).getFullYear()}
                </span>
              </div>

              {/* Overview */}
              <h3 className="text-xl font-bold mb-4">Overview</h3>
              <p
                className={`leading-relaxed text-lg md:text-xl font-medium mb-8 max-w-2xl ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {movie.overview}
              </p>

              {/* ─── DOWNLOAD OPTIONS SECTION (UPDATED) ─────────────────────────── */}
              <div id="download-options" className="mb-12">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-xl ${
                      darkMode ? 'bg-indigo-900/40' : 'bg-indigo-50'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Download{' '}
                    <span className={darkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                      Options
                    </span>
                  </h3>
                </div>
                <p
                  className={`text-[11px] font-medium mb-6 ml-11 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  Click a quality to see available sources, then choose your preferred provider.
                </p>

                {/* Quality Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {downloadOptions.map((item) => (
                    <div key={item.res}>
                      {/* Quality Card (toggle) */}
                      <button
                        onClick={() =>
                          setActiveDownload(activeDownload === item.res ? null : item.res)
                        }
                        className={`group relative overflow-hidden w-full p-4 rounded-[1.8rem] border transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left ${
                          activeDownload === item.res
                            ? darkMode
                              ? 'bg-indigo-900/40 border-indigo-700/60'
                              : 'bg-indigo-50 border-indigo-200'
                            : darkMode
                            ? 'bg-gray-900/40 border-gray-800 hover:border-white/20'
                            : 'bg-white border-gray-100 hover:border-indigo-100 shadow-sm'
                        }`}
                      >
                        {/* Resolution & Label */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4
                              className={`text-lg font-black leading-tight ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {item.res}
                            </h4>
                            <p
                              className={`text-[9px] font-bold uppercase tracking-widest ${
                                darkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}
                            >
                              {item.label}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${item.badgeBg}`}
                          >
                            {item.badge}
                          </span>
                        </div>

                        {/* Size & Chevron */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {item.size}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                              activeDownload === item.res
                                ? darkMode
                                  ? 'bg-indigo-600'
                                  : 'bg-indigo-500'
                                : darkMode
                                ? 'bg-white/10'
                                : 'bg-gray-100'
                            }`}
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                activeDownload === item.res ? 'rotate-180' : ''
                              } ${
                                activeDownload === item.res
                                  ? 'text-white'
                                  : darkMode
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Provider Dropdown (expands below card) */}
                      <AnimatePresence>
                        {activeDownload === item.res && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div
                              className={`rounded-2xl border overflow-hidden divide-y ${
                                darkMode
                                  ? 'bg-gray-900 border-gray-800 divide-gray-800'
                                  : 'bg-white border-gray-100 divide-gray-100 shadow-sm'
                              }`}
                            >
                              {item.providers.map((provider) => (
                                <a
                                  key={provider.name}
                                  href={provider.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
                                    darkMode
                                      ? 'hover:bg-gray-800 text-gray-300'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-base">{provider.icon}</span>
                                    <span className="text-[12px] font-bold tracking-tight">
                                      {provider.name}
                                    </span>
                                  </div>
                                  <svg
                                    className={`w-3.5 h-3.5 ${
                                      darkMode ? 'text-gray-600' : 'text-gray-400'
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <p
                  className={`text-[10px] font-medium mt-6 flex items-start gap-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                  Links open external sites. Availability may vary by region. We do not host any
                  files — all content is provided by third-party platforms.
                </p>
              </div>
              {/* ─── END DOWNLOAD OPTIONS ────────────────────────────────────────── */}

              {/* TOP CAST SECTION */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight">Top Cast</h3>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest md:hidden ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    Swipe →
                  </span>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                  {cast &&
                    cast.map((person) => (
                      <div key={person.id} className="text-center shrink-0 group snap-start">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md border-2 transition-all duration-500 group-hover:scale-110 ${
                            darkMode
                              ? 'border-gray-700 group-hover:shadow-indigo-900/30 group-hover:border-indigo-800'
                              : 'border-white group-hover:shadow-indigo-100 group-hover:border-indigo-50'
                          }`}
                        >
                          <img
                            src={
                              person.profile_path
                                ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                                : 'https://via.placeholder.com/200?text=N/A'
                            }
                            className="w-full h-full object-cover"
                            alt={person.name}
                          />
                        </div>
                        <p
                          className={`text-[11px] font-black w-24 truncate leading-tight ${
                            darkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}
                        >
                          {person.name}
                        </p>
                        <p
                          className={`text-[9px] font-bold truncate w-24 mt-1 uppercase tracking-tighter ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          {person.character}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* DESKTOP-ONLY BUTTONS */}
              <div className="hidden md:flex items-center gap-5 mt-4">
                <button
                  onClick={() => {
                    setShowPlayer(!showPlayer)
                    if (!showPlayer) {
                      setTimeout(() => {
                        playerSectionRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                      }, 100)
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className={`
                    relative group overflow-hidden
                    px-10 py-5 
                    flex items-center gap-4
                    rounded-[2.2rem] font-black tracking-tighter text-lg
                    transition-all duration-500 ease-out
                    active:scale-95 active:brightness-90
                    ${
                      showPlayer
                        ? 'bg-zinc-800 text-white border border-white/10 shadow-xl'
                        : 'bg-white text-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_50px_-5px_rgba(79,70,229,0.4)]'
                    }
                  `}
                >
                  {!showPlayer && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    {showPlayer ? (
                      <div className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full">
                        <span className="text-white text-xs">✕</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center bg-black rounded-full group-hover:bg-white transition-colors duration-300">
                        <img
                          src={play}
                          alt="play"
                          className="w-3 h-3 ml-0.5 group-hover:invert transition-all"
                        />
                      </div>
                    )}
                    <span
                      className={
                        !showPlayer ? 'group-hover:text-white transition-colors duration-300' : ''
                      }
                    >
                      {showPlayer ? 'CLOSE CINEMA' : 'WATCH NOW'}
                    </span>
                  </div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                </button>

                <button
                  onClick={() => getTrailer(movie.id)}
                  className={`group flex items-center gap-4 px-8 py-5 backdrop-blur-2xl border font-bold rounded-[2.2rem] transition-all duration-500 shadow-2xl active:scale-95 ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white/10 border-white/20 text-black hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full transition-transform duration-500 group-hover:rotate-[360deg]">
                    <img
                      src={play}
                      alt="play"
                      className={`w-full h-full object-contain ${darkMode ? 'invert' : ''}`}
                    />
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
                  {isAdding ? 'Adding...' : '+ Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM BAR */}
        <div
          className={`fixed bottom-0 left-0 right-0 p-5 pb-8 backdrop-blur-2xl border-t z-50 md:hidden transition-colors duration-500 ${
            darkMode
              ? 'bg-gray-950/80 border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]'
              : 'bg-white/80 border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'
          }`}
        >
          <div className="max-w-md mx-auto flex items-center gap-3">
            {/* PRIMARY: WATCH NOW */}
            <button
              onClick={() => {
                const turningOn = !showPlayer
                setShowPlayer(turningOn)
                if (turningOn) {
                  setTimeout(() => {
                    playerSectionRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }, 100)
                }
              }}
              className={`relative flex-[2] flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm tracking-tight transition-all duration-300 active:scale-95 ${
                showPlayer
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)]'
              }`}
            >
              <img
                src={showPlayer ? close : play}
                alt="icon"
                className={`w-4 h-4 ${!showPlayer && 'invert'}`}
              />
              {showPlayer ? 'CLOSE PLAYER' : 'WATCH NOW'}
            </button>

            {/* DOWNLOAD (scrolls to download section) */}
            <button
              onClick={() => {
                const downloadSection = document.getElementById('download-options')
                downloadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all active:scale-90 ${
                darkMode
                  ? 'bg-gray-900 border-white/10 text-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <svg
                className={`w-4 h-4 ${darkMode ? 'opacity-70' : 'opacity-60'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tighter">Save</span>
            </button>

            {/* TRAILER */}
            <button
              onClick={() => getTrailer(movie.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all active:scale-90 ${
                darkMode
                  ? 'bg-gray-900 border-white/10 text-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <img
                src={play}
                className={`w-4 h-4 ${darkMode ? 'invert opacity-70' : 'opacity-60'}`}
                alt="play"
              />
              <span className="text-[10px] font-black uppercase tracking-tighter">Trailer</span>
            </button>

            {/* WATCHLIST */}
            <button
              onClick={addToWatchlist}
              disabled={isAdding}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all active:scale-90 ${
                darkMode
                  ? 'bg-gray-900 border-white/10 text-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              } ${isAdding ? 'opacity-50' : ''}`}
            >
              <span className="text-lg leading-none font-light">{isAdding ? '...' : '+'}</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Watchlist</span>
            </button>
          </div>
        </div>

        {/* 3. SOUNDTRACK SECTION */}
        <SoundtrackSection
          movieTitle={isTV ? movie.name : movie.title}
          year={new Date(
            isTV ? movie.first_air_date : movie.release_date
          )
            .getFullYear()
            .toString()}
          darkMode={darkMode}
        />

        {/* RELATED MOVIES SECTION */}
        <div className="mt-12 md:mt-32">
          <header className="mb-8 md:mb-12 flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
              Related <span className="text-indigo-600">Movies.</span>
            </h2>
            <span
              className={`text-[10px] font-black uppercase tracking-widest md:hidden ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              Swipe →
            </span>
          </header>

          <div className="flex overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10 pb-10 scrollbar-hide snap-x snap-mandatory px-2 md:px-0">
            {related.map((m) => {
              const relatedPoster = m.poster_path
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image'

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    navigate(`/movie/${m.id}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="min-w-[70%] sm:min-w-[40%] md:min-w-full snap-start group cursor-pointer"
                >
                  <div
                    className={`relative aspect-[2/3] rounded-[2.2rem] md:rounded-[2.5rem] overflow-hidden mb-4 shadow-sm border transition-all duration-700 hover:shadow-xl hover:-translate-y-3 ${
                      darkMode ? 'border-gray-800' : 'border-gray-100'
                    }`}
                  >
                    <img
                      src={relatedPoster}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h3
                    className={`text-lg font-bold truncate px-2 transition-colors ${
                      darkMode ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'
                    }`}
                  >
                    {m.title}
                  </h3>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 mt-1 ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {new Date(m.release_date).getFullYear()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div
            className={`absolute inset-0 backdrop-blur-[40px] ${
              darkMode ? 'bg-gray-950/85' : 'bg-[#fbfbfd]/85'
            }`}
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-6xl aspect-video z-10 group">
            <div className="absolute inset-0 -z-10 overflow-visible">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-500/20 blur-[80px] rounded-full animate-siri-liquid" />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[100%] h-[100%] bg-green-500/20 blur-[100px] rounded-full animate-siri-liquid"
                style={{ animationDelay: '-2s' }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/3 w-[80%] h-[80%] bg-blue-400/20 blur-[60px] rounded-full animate-siri-liquid"
                style={{ animationDelay: '-4s' }}
              />
            </div>

            <div className="relative w-full h-full bg-black rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
                  Liquid <span className="text-white">Cinema</span>
                </span>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 active:scale-90"
              >
                <span className="text-xl">✕</span>
              </button>

              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="relative z-10 w-full h-full border-0"
              />
            </div>

            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full flex justify-center pb-4">
              <div
                className={`px-6 py-2.5 backdrop-blur-2xl border rounded-full shadow-lg flex items-center gap-3 ${
                  darkMode
                    ? 'bg-gray-800/40 border-gray-700/40'
                    : 'bg-white/40 border-white/40'
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-600">
                  Now Playing
                </span>
                <div
                  className={`h-3 w-[1px] ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-[11px] md:text-xs font-bold tracking-tight whitespace-nowrap ${
                    darkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  {isTV ? movie.name : movie.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}