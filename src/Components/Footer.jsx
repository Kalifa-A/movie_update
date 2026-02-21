import { NavLink } from "react-router-dom"

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-20 border-t border-gray-100 bg-white/40 backdrop-blur-md">
      {/* Liquid-style accent line at the top */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand Side */}
          <div className="text-center md:text-left">
            <NavLink to="/" className="text-xl font-bold text-gray-900 tracking-tight">
              Movies<span className="text-indigo-600">.</span>
            </NavLink>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              The ultimate cinematic experience, designed with precision and fluidity.
            </p>
          </div>

          {/* Quick Links with "Water Drop" Hover Effect */}
          <nav className="flex gap-8 text-sm font-medium text-gray-600">
            {["Privacy", "Terms", "Support", "Contact"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="hover:text-indigo-600 transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Social / Credits */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-4">
              {/* Simple Minimalist Social Icons Placeholder */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-gray-400 hover:text-indigo-600">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer">
                <span className="text-xs font-bold text-gray-400 hover:text-indigo-600">IG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-medium text-gray-400 uppercase tracking-widest">
          <p>© {currentYear} MOVIES INC.</p>
          <p>MADE WITH PRECISION</p>
        </div>
      </div>
    </footer>
  )
}