import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import MovieList from '../Pages/MovieList'
import MovieDetail from '../Pages/MovieDetails'
import Search from '../Pages/search'
import NotFound from '../Pages/PageNotFound'

export default function AllRoutes() {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main>
        <Routes>
          <Route path="/" element={<MovieList api_path="now_playing" />} />
          <Route path="/popular" element={<MovieList api_path="popular" />} />
          <Route path="/top-rated" element={<MovieList api_path="top_rated" />} />
          <Route path="/upcoming" element={<MovieList api_path="upcoming" />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}