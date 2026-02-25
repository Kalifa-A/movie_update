import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const res = await axios.post(`https://movie-backend-psi.vercel.app/api/auth/${endpoint}`, formData);
      
      if (isLogin) {
        // 1. Save credentials to local storage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        
        // 2. Alert the user (Optional but nice)
        console.log("Login successful!");
        
        // 3. YOUR REQUIREMENT: Redirect directly to watchlist after login
        navigate('/watchlist');
        
        // Force a page refresh or custom event if your Navbar needs to update immediately
        window.dispatchEvent(new Event("storage")); 
      } else {
        // If they just registered, switch them to the login view
        alert("Account created! Now please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">
          {isLogin ? "Welcome back." : "Create account."}
        </h2>
        <p className="text-gray-500 text-center mb-10">
          {isLogin ? "Sign in to see your collection." : "Join us to start your watchlist."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="Username"
              autoComplete="username"
              className="w-full px-6 py-4 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full px-6 py-4 bg-gray-100/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg transform active:scale-[0.98] transition-all duration-200"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isLogin ? "New to Liquid? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-bold hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

}
