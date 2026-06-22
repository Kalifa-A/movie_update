import { NavLink } from "react-router-dom"
import { useDarkMode } from "../Context/DarkModeContext"

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { darkMode } = useDarkMode()

  // Define the links for easy mapping
  const footerLinks = [
    { name: "Privacy", to: "/privacy" },
    { name: "Terms", to: "/terms" },
    { name: "Support", to: "/support" },
    { name: "Contact", to: "/contact" },
  ]

  return (
    <footer className={`w-full border-t mt-auto transition-colors duration-500 ${darkMode ? 'bg-gray-950 border-gray-900/60' : 'bg-white border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <NavLink to="/" className={`text-2xl font-bold tracking-tighter transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              MOVIES<span className="text-indigo-600">.</span>
            </NavLink>
            <p className={`text-sm mt-2 max-w-xs font-medium leading-relaxed transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Elevating the cinematic experience through fluid design and premium technology.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {footerLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={`text-sm font-semibold transition-all duration-300 relative group ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                {link.name}
                {/* Subtle Underline Animation */}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${darkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`}></span>
              </NavLink>
            ))}
          </nav>

          {/* Social / Legal Area */}
          <div className="flex flex-col items-center md:items-end gap-3">
             <div className="flex gap-4">
                <span className={`w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer border text-xs font-bold ${darkMode ? 'bg-gray-900 text-gray-200 hover:bg-indigo-950 hover:text-indigo-400 border-gray-800' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-gray-200'}`}>X</span>
                <span className={`w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer border text-xs font-bold ${darkMode ? 'bg-gray-900 text-gray-200 hover:bg-indigo-950 hover:text-indigo-400 border-gray-800' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-gray-200'}`}>IG</span>
             </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className={`h-[1px] w-full bg-gradient-to-r from-transparent to-transparent my-10 ${darkMode ? 'via-gray-800' : 'via-gray-200'}`}></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
            © {currentYear} MOVIES INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
              System Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}