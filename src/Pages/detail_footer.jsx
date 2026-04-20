import React from "react";
import { useDarkMode } from "../Context/DarkModeContext";

export default function DetailFooter() {
  const { darkMode } = useDarkMode();

  return (
    /* We use a high z-index and relative positioning to ensure 
       it stays above any background gradients or negative margins */
    <div className="w-full mt-20 clear-both"> 
      <footer className={`pb-12 border-t pt-12 text-center transition-colors duration-500 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col items-center gap-4">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_#4f46e5]" />
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Designed &amp; Engineered By
            </span>
          </div>

          {/* Brand Name */}
          <h2 className={`text-2xl font-black tracking-tighter cursor-default transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            KALIFA<span className="text-indigo-600">.</span>
          </h2>

          {/* Social Links */}
          <div className="flex gap-6 mt-2">
            <a 
              href="https://github.com/Kalifa-A/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 py-2 ${darkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              GitHub
            </a>
            
            <a 
              href="#portfolio" 
              className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 py-2 ${darkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              Portfolio
            </a>
            
            <a 
              href="https://www.linkedin.com/in/kalifa-a-695139266/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 py-2 ${darkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export { DetailFooter };