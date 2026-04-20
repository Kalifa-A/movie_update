import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear(); // Clears token and username in one go
    navigate('/auth');
    window.location.reload(); // Ensures the UI resets completely
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50">
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] px-8 py-4 rounded-[2rem] flex justify-between items-center transition-all duration-300">
        
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter italic group">
          LIQUID<span className="text-indigo-600 group-hover:animate-pulse">.</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-8 font-semibold text-sm">
          <Link to="/" className="text-gray-500 hover:text-indigo-600 transition-colors">Home</Link>
          
          {token ? (
            <>
              <Link to="/watchlist" className="text-gray-500 hover:text-indigo-600 transition-colors">Watchlist</Link>
              
              <div className="h-6 w-[1px] bg-gray-200 mx-2" /> {/* Divider */}
              
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-gray-400 text-xs uppercase tracking-widest font-bold">
                  {username}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 active:scale-95 transition-all"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}