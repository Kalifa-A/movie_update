import { useState, useRef, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import searchIcon from "../assets/search.png"

export const Header = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)

  // This state tracks the "Water Drop" position
  const [dropStyle, setDropStyle] = useState({ left: 0, width: 0, opacity: 0 })

  const links = [
    { to: "/", label: "Home" },
    { to: "/popular", label: "Popular" },
    { to: "/top-rated", label: "Top Rated" },
    { to: "/upcoming", label: "Upcoming" },
  ]

  // The Magic Logic: Calculates the "Water Drop" position
  const updateDrop = (element) => {
    if (!element) return
    setDropStyle({
      left: element.offsetLeft,
      width: element.offsetWidth,
      opacity: 1,
    })
  }

  // When clicking or hovering, move the drop
  const handleMouseEnter = (e) => updateDrop(e.currentTarget)
  
  // When leaving the nav, snap the drop back to the active link
  const handleMouseLeave = () => {
    const activeLink = navRef.current?.querySelector(".active")
    if (activeLink) {
      updateDrop(activeLink)
    } else {
      setDropStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }

  // Initial position on load
  useEffect(() => {
    setTimeout(() => {
      const activeLink = navRef.current?.querySelector(".active")
      if (activeLink) updateDrop(activeLink)
    }, 100)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold tracking-tighter text-gray-900 group">
          MOVIES<span className="text-indigo-600 transition-all duration-500 group-hover:pl-1">.</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav 
          ref={navRef}
          onMouseLeave={handleMouseLeave}
          className="hidden md:flex items-center relative gap-1 p-1 bg-gray-100/30 rounded-full"
        >
          {/* THE WATER DROP (Background Pill) */}
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
                `px-5 py-1.5 text-sm font-medium transition-colors duration-500 rounded-full
                ${isActive ? "text-indigo-600 active" : "text-gray-500 hover:text-gray-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Search Button (Restored & Enhanced) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/search")}
            className="group relative p-2 rounded-full bg-gray-100/50 hover:bg-indigo-50 transition-all duration-300 active:scale-90"
          >
            <img
              src={searchIcon}
              alt="Search"
              className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
            />
            {/* Liquid pulse effect on hover */}
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-0 transition-all duration-700"></div>
          </button>

          {/* Mobile Menu Toggle */}
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
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-white/90 backdrop-blur-xl ${open ? "max-h-64 border-t" : "max-h-0"}`}>
        <div className="p-6 space-y-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="block text-lg font-semibold text-gray-800">
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}