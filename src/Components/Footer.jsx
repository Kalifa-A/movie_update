import { NavLink } from "react-router-dom"

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Define the links for easy mapping
  const footerLinks = [
    { name: "Privacy", to: "/privacy" },
    { name: "Terms", to: "/terms" },
    { name: "Support", to: "/support" },
    { name: "Contact", to: "/contact" },
  ]

  return (
    <footer className="w-full bg-white/60 backdrop-blur-2xl border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <NavLink to="/" className="text-2xl font-bold text-gray-900 tracking-tighter">
              MOVIES<span className="text-indigo-600">.</span>
            </NavLink>
            <p className="text-gray-400 text-sm mt-2 max-w-xs font-medium leading-relaxed">
              Elevating the cinematic experience through fluid design and premium technology.
            </p>
          </div>

          {/* Navigation - YOUR REQUESTED CONTENT */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {footerLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-all duration-300 relative group"
              >
                {link.name}
                {/* Subtle Underline Animation */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}
          </nav>

          {/* Social / Legal Area */}
          <div className="flex flex-col items-center md:items-end gap-3">
             <div className="flex gap-4">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer border border-gray-100 text-xs font-bold">X</span>
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer border border-gray-100 text-xs font-bold">IG</span>
             </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-10"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            © {currentYear} MOVIES INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              System Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}