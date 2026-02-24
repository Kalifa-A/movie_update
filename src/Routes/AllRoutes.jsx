import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import MovieList from '../Pages/MovieList'
import MovieDetail from '../Pages/MovieDetails'
import Search from '../Pages/search'
import NotFound from '../Pages/PageNotFound'
import LegalPage from '../Pages/LegalPage'
import { Watchlist } from '../Pages/Watchlist'
import Auth from '../Pages/Auth'

export default function AllRoutes() {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfd]">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MovieList api_path="now_playing" />} />
          <Route path="/popular" element={<MovieList api_path="popular" />} />
          <Route path="/top-rated" element={<MovieList api_path="top_rated" />} />
          <Route path="/upcoming" element={<MovieList api_path="upcoming" />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={
              <LegalPage 
                title="Privacy Policy" 
                content={
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Your data belongs to you.</h2>
                    <p>At Movies., we believe privacy is a fundamental human right. We don't track your every move or sell your movie preferences to third parties.</p>
                    <p>We only collect essential data needed to provide a fluid experience, such as your watchlists and regional settings. Everything else stays on your device.</p>
                  </>
                } 
              />
            } />

            <Route path="/terms" element={
              <LegalPage 
                title="Terms of Service" 
                content={
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Simple and Transparent.</h2>
                    <p>By using Movies., you agree to enjoy our cinematic experience responsibly. Our content is provided via TMDB API for your personal, non-commercial use.</p>
                    <p>Please respect the creators and the copyright of the films displayed on this platform.</p>
                  </>
                } 
              />
            } />

            <Route path="/support" element={
              <LegalPage 
                title="Support" 
                content={
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">We're here to help.</h2>
                    <p>Experiencing a flicker in the UI? Or perhaps a movie backdrop isn't loading correctly? Our technical team is dedicated to maintaining the "Liquid" experience.</p>
                    <p>Check our FAQ or reach out via the contact form if you encounter any bugs.</p>
                  </>
                } 
              />
            } />

            <Route path="/contact" element={
              <LegalPage 
                title="Contact Us" 
                content={
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Get in touch.</h2>
                    <p>Have a suggestion for a new feature? Or want to talk about film? We'd love to hear from you.</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <p className="font-bold text-gray-900">Email:</p>
                      <p className="text-indigo-600">mailpannunga@movies.com</p>
                    </div>
                  </div>
                } 
              />
            } />
        </Routes>
      </main>
    </div>
  )
}