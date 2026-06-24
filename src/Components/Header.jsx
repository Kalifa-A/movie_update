import { useState, useRef, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import searchIcon from "../assets/search.png"
import { useDarkMode } from "../Context/DarkModeContext"

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const { darkMode, mediaType, setMediaType } = useDarkMode()

  // Auth State logic
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const [dropStyle, setDropStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const [activeMobileTab, setActiveMobileTab] = useState('home')

  useEffect(() => {
    const path = location.pathname
    if (path === '/watchlist') {
      setActiveMobileTab('watchlist')
    } else if (path === '/top-rated') {
      setActiveMobileTab('top-rated')
    } else if (path === '/tv') {
      setActiveMobileTab('tv')
    } else if (path === '/movies') {
      setActiveMobileTab('movie')
    } else if (path === '/') {
      setActiveMobileTab('home')
    } else {
      setActiveMobileTab(mediaType === 'tv' ? 'tv' : 'movie')
    }
  }, [location.pathname, mediaType])

  // Define links - we add "Watchlist" only if token exists
  const allNavbarItems = [
    { type: 'route', to: "/", label: "Home" },
    { type: 'route', to: "/movies", label: "Movies" },
    { type: 'route', to: "/tv", label: "TV Shows" },
    { type: 'route', to: "/popular", label: "Popular" },
    { type: 'route', to: "/top-rated", label: "Top Rated" },
    { type: 'route', to: "/upcoming", label: "Upcoming" },
  ]

  if (token) {
    allNavbarItems.push({ type: 'route', to: "/watchlist", label: "Watchlist" });
  }

  const updateDrop = (element) => {
    if (!element) return
    setDropStyle({
      left: element.offsetLeft,
      width: element.offsetWidth,
      opacity: 1,
    })
  }

  const handleMouseEnter = (e) => updateDrop(e.currentTarget)
  
  const handleMouseLeave = () => {
    const activeLink = navRef.current?.querySelector(".active")
    if (activeLink) {
      updateDrop(activeLink)
    } else {
      setDropStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
    window.location.reload();
  };

  useEffect(() => {
    setTimeout(() => {
      const activeLink = navRef.current?.querySelector(".active")
      if (activeLink) updateDrop(activeLink)
    }, 100)
  }, [location.pathname, token, mediaType]) // Re-run if token or mediaType changes

  const handleSearchClick = () => {
    if (location.pathname === "/search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("focus-search-input"));
    } else {
      navigate("/search");
    }
  };

  // Mobile Bottom Tab Configuration
  const mobileTabs = [
    { 
      id: 'home', 
      label: 'Home',
      action: () => navigate('/'), 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    { 
      id: 'watchlist', 
      label: 'Watchlist',
      action: () => navigate('/watchlist'), 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      )
    },
    { 
      id: 'top-rated', 
      label: 'Top Rated',
      action: () => navigate('/top-rated'), 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    { 
      id: 'tv', 
      label: 'TV',
      action: () => navigate('/tv'), 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
          <rect width="20" height="15" x="2" y="3" rx="2" />
          <path d="M12 17v4M8 21h8" />
        </svg>
      )
    },
    { 
      id: 'movie', 
      label: 'Movies',
      action: () => navigate('/movies'), 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 3v18M17 3v18M3 7.5h4M3 12h4M3 16.5h4M17 7.5h4M17 12h4M17 16.5h4" />
        </svg>
      )
    },
  ]

  const tabIds = ['home', 'watchlist', 'top-rated', 'tv', 'movie']
  const activeIndex = tabIds.indexOf(activeMobileTab)

  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-colors duration-500 ${darkMode ? 'bg-gray-900/70 border-gray-800/50' : 'bg-white/70 border-gray-100/50'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className={`text-xl font-black tracking-tighter group italic transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Movie<span className="text-indigo-600 transition-all duration-500 group-hover:pl-1">.</span>
          </NavLink>

          {/* Desktop Nav with Water Drop */}
          <nav 
            ref={navRef}
            onMouseLeave={handleMouseLeave}
            className={`hidden md:flex items-center relative gap-1 p-1 rounded-full transition-colors ${darkMode ? 'bg-gray-800/30' : 'bg-gray-100/30'}`}
          >
            <div 
              className={`absolute h-[80%] shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
              style={{
                left: `${dropStyle.left}px`,
                width: `${dropStyle.width}px`,
                opacity: dropStyle.opacity,
              }}
            />

            {allNavbarItems.map((item) => {
              const isItemActive = item.type === 'route'
                ? location.pathname === item.to
                : item.active;

              if (item.type === 'route') {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onMouseEnter={handleMouseEnter}
                    className={() => 
                      `px-5 py-1.5 text-sm font-bold transition-colors duration-500 rounded-full
                      ${isItemActive 
                        ? "text-indigo-600 active" 
                        : darkMode 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-500 hover:text-gray-900"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              } else {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    onMouseEnter={handleMouseEnter}
                    className={`px-5 py-1.5 text-sm font-bold transition-colors duration-500 rounded-full cursor-pointer
                      ${isItemActive 
                        ? "text-indigo-600 active" 
                        : darkMode 
                          ? "text-gray-400 hover:text-white" 
                          : "text-gray-500 hover:text-gray-900"}`}
                  >
                    {item.label}
                  </button>
                );
              }
            })}
          </nav>

          {/* Action Buttons: Search + Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSearchClick}
              aria-label="Search Movies"
              className={`group relative flex items-center gap-2 p-2 px-3 rounded-full transition-all duration-500 active:scale-95 
                ${darkMode 
                  ? 'bg-gray-800/40 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30' 
                  : 'bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200'} 
                shadow-[0_4px_20px_-1px_rgba(0,0,0,0.1)] hover:shadow-indigo-500/20`}
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
              <svg 
                className={`w-4 h-4 transition-all duration-500 group-hover:rotate-12 ${darkMode ? 'text-gray-400 group-hover:text-indigo-400' : 'text-gray-600 group-hover:text-indigo-600'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden lg:block ${darkMode ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-600'}`}>
                Search
              </span>
            </button>

            <div className={`h-6 w-[1px] mx-1 hidden md:block ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {token ? (
              <div className="flex items-center gap-3">
                <span className={`hidden lg:block text-[10px] font-black uppercase tracking-tighter ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {username}
                </span>
                <button 
                  onClick={handleLogout}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 ${darkMode ? 'bg-white text-gray-900 hover:bg-red-500 hover:text-white' : 'bg-gray-900 text-white hover:bg-red-600'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate("/auth")}
                className="px-5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar with Liquid Water Effect */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] z-[100] transition-colors duration-500">
        <div className={`relative flex items-center justify-between p-2 pb-3 rounded-[2rem] border shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-500 ${darkMode ? 'bg-black/85 border-zinc-800/80 shadow-black' : 'bg-white/90 border-gray-200/80'} backdrop-blur-2xl`}>
          
          {/* Sliding Water Bubble Background */}
          <div 
            className="absolute top-2 left-0 w-1/5 flex justify-center items-center pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <div 
              className="relative w-11 h-11 bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 dark:from-indigo-500/10 dark:to-transparent border border-indigo-400/35 shadow-[0_8px_25px_rgba(79,70,229,0.3),-2.5px_-2.5px_6px_rgba(239,68,68,0.35),2.5px_2.5px_6px_rgba(59,130,246,0.35),inset_0_4px_8px_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.1)] animate-liquid-wobble overflow-hidden"
              style={{
                backdropFilter: 'url(#liquid-refraction) blur(1.5px) saturate(130%)',
                WebkitBackdropFilter: 'url(#liquid-refraction) blur(1.5px) saturate(130%)',
              }}
            >
              {/* Light Reflection Highlight for Water Drop */}
              <div className="absolute top-1 left-1.5 w-3.5 h-1.5 bg-white/60 rounded-full rotate-[-15deg] blur-[0.2px] pointer-events-none" />
              {/* Inner 3D depth overlay */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} 
              />
            </div>
          </div>

          {/* Tab Buttons */}
          {mobileTabs.map((tab, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="w-1/5 flex flex-col items-center z-10 transition-all duration-300 active:scale-90 cursor-pointer"
              >
                <div className={`w-11 h-11 flex items-center justify-center rounded-[1.2rem] transition-all duration-300 ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 scale-110' 
                    : darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider mt-1 transition-colors duration-300 ${
                  isActive 
                    ? (darkMode ? 'text-indigo-400' : 'text-indigo-600') 
                    : (darkMode ? 'text-zinc-500' : 'text-gray-400')
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* SVG Liquid Refraction Filter for Water Droplet Lens */}
      <svg className="absolute w-0 h-0" width="0" height="0" style={{ display: 'block', visibility: 'hidden' }}>
        <defs>
          <filter id="liquid-refraction">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </>
  )
}
