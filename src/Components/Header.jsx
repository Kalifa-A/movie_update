import { useState, useRef, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import searchIcon from "../assets/search.png"
import { useDarkMode } from "../Context/DarkModeContext"

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const { darkMode } = useDarkMode()

  // Auth State logic
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const [dropStyle, setDropStyle] = useState({ left: 0, width: 0, opacity: 0 })

  // Define links - we add "Watchlist" only if token exists
  const links = [
    { to: "/", label: "Home" },
    { to: "/popular", label: "Popular" },
    { to: "/top-rated", label: "Top Rated" },
    { to: "/upcoming", label: "Upcoming" },
  ]

  // Add Watchlist to the links array dynamically if user is logged in
  if (token) {
    links.push({ to: "/watchlist", label: "Watchlist" });
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
  }, [location.pathname, token]) // Re-run if token changes (login/logout)

  const handleSearchClick = () => {
    if (location.pathname === "/search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("focus-search-input"));
    } else {
      navigate("/search");
    }
  };

  return (
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

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onMouseEnter={handleMouseEnter}
              className={({ isActive }) => 
                `px-5 py-1.5 text-sm font-bold transition-colors duration-500 rounded-full
                ${isActive 
                  ? "text-indigo-600 active" 
                  : darkMode 
                    ? "text-gray-400 hover:text-white" 
                    : "text-gray-500 hover:text-gray-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
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

      {/* Mobile Scrollable Nav */}
      <div className={`md:hidden overflow-x-auto scrollbar-hide border-t flex items-center gap-2 px-4 py-3 transition-colors duration-500 ${darkMode ? 'border-gray-800/50 bg-gray-900/95' : 'border-gray-100/50 bg-white/95'}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `px-4 py-1.5 text-sm font-bold whitespace-nowrap transition-colors duration-500 rounded-full
              ${isActive 
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                : darkMode 
                  ? "text-gray-400 hover:text-white hover:bg-gray-800" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
