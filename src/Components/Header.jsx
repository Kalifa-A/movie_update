import { useState, useRef, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import searchIcon from "../assets/search.png"

export const Header = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)

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

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="text-xl font-black tracking-tighter text-gray-900 group italic">
          Movie<span className="text-indigo-600 transition-all duration-500 group-hover:pl-1">.</span>
        </NavLink>

        {/* Desktop Nav with Water Drop */}
        <nav 
          ref={navRef}
          onMouseLeave={handleMouseLeave}
          className="hidden md:flex items-center relative gap-1 p-1 bg-gray-100/30 rounded-full"
        >
          <div 
            className="absolute h-[80%] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10"
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
                ${isActive ? "text-indigo-600 active" : "text-gray-500 hover:text-gray-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons: Search + Auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            className="p-2 rounded-full bg-gray-100/50 hover:bg-indigo-50 transition-all active:scale-90"
          >
            <img src={searchIcon} alt="Search" className="w-5 h-5 opacity-60" />
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden md:block" />

          {token ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-tighter text-gray-400">
                {username}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-red-600 transition-all active:scale-95"
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

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-gray-900 transition-all ${open ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-900 ${open ? "opacity-0" : ""}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-900 transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-white/95 backdrop-blur-xl ${open ? "max-h-96 border-t" : "max-h-0"}`}>
        <div className="p-6 space-y-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="block text-lg font-bold text-gray-800">
              {link.label}
            </NavLink>
          ))}
          {!token && (
            <button onClick={() => { navigate("/auth"); setOpen(false); }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl">
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
