import React from "react";

export default function DetailFooter() {
  return (
    /* We use a high z-index and relative positioning to ensure 
       it stays above any background gradients or negative margins */
    <div className="relative z-[10] w-full mt-32"> 
      <footer className="pb-12 border-t border-gray-100 pt-12 text-center">
        <div className="flex flex-col items-center gap-4">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_#4f46e5]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Designed & Engineered By
            </span>
          </div>

          {/* Brand Name */}
          <h2 className="text-2xl font-black tracking-tighter text-gray-900 cursor-default">
            KALIFA<span className="text-indigo-600">.</span>
          </h2>

          {/* Social Links */}
          <div className="flex gap-6 mt-2">
            <a 
              href="https://github.com/Kalifa-A/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all duration-300 py-2"
            >
              GitHub
            </a>
            
            <a 
              href="#portfolio" 
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all duration-300 py-2"
            >
              Portfolio
            </a>
            
            <a 
              href="https://www.linkedin.com/in/kalifa-a-695139266/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all duration-300 py-2"
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
