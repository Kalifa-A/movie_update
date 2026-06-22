import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDarkMode } from "../Context/DarkModeContext";
import star from "../assets/star.png";
import Footer from "./detail_footer";

export default function PersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_TMDB_KEY || import.meta.env.VITE_API_ID;

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch person details
        const personRes = await fetch(
          `https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}&language=en-US`
        );
        if (!personRes.ok) throw new Error("Failed to fetch actor details");
        const personData = await personRes.json();
        setPerson(personData);

        // Fetch combined credits (movies and TV shows)
        const creditsRes = await fetch(
          `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}&language=en-US`
        );
        if (creditsRes.ok) {
          const creditsData = await creditsRes.json();
          // Sort by popularity to show most famous projects first
          const sortedCast = (creditsData.cast || []).sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
          );
          setCredits(sortedCast.slice(0, 15)); // Top 15 credits
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id, API_KEY]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-950 text-white" : "bg-[#fbfbfd] text-gray-900"}`}>
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-medium opacity-80">Loading Profile...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">
        {error || "Actor profile not found"}
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div className={`min-h-screen pt-28 pb-20 transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-100" : "bg-[#fbfbfd] text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Main Details Card */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start mb-20">
          
          {/* Portrait Headshot */}
          <div className="w-full md:w-1/3 shrink-0 flex justify-center md:block">
            <div className="w-64 h-96 md:w-full md:h-auto aspect-[2/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <img src={profileUrl} alt={person.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2 block">
              {person.known_for_department || "Actor"}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none">
              {person.name}
            </h1>

            {/* Quick Metadata */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 text-sm font-semibold opacity-90">
              {person.birthday && (
                <div>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>Born: </span>
                  <span>
                    {person.birthday} 
                    {person.deathday ? ` - Died: ${person.deathday}` : ` (Age ${new Date().getFullYear() - new Date(person.birthday).getFullYear()})`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <span className={darkMode ? "text-gray-500" : "text-gray-400"}>Origin: </span>
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography ? (
              <>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Biography</h3>
                <p className={`leading-relaxed text-base md:text-lg font-medium whitespace-pre-line mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {person.biography}
                </p>
              </>
            ) : (
              <p className="italic opacity-50 mb-8">No biography available for this actor.</p>
            )}
          </div>
        </div>

        {/* Famous Filmography Carousel */}
        {credits.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter">
                Famous <span className="text-indigo-600">Works.</span>
              </h2>
              <span className={`text-[10px] font-black uppercase tracking-widest md:hidden ${darkMode ? "text-gray-600" : "text-gray-400"}`}>Swipe →</span>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x px-2 md:px-0">
              {credits.map((item) => {
                const isTV = item.media_type === "tv";
                const itemTitle = isTV ? item.name : item.title;
                const releaseYear = new Date(isTV ? item.first_air_date : item.release_date).getFullYear();
                const posterUrl = item.poster_path
                  ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Poster";

                return (
                  <div
                    key={`${item.id}-${item.media_type}`}
                    onClick={() => {
                      navigate(isTV ? `/tv/${item.id}` : `/movie/${item.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="min-w-[45%] sm:min-w-[25%] md:min-w-[18%] snap-start group cursor-pointer"
                  >
                    <div className={`relative aspect-[2/3] rounded-[1.8rem] overflow-hidden mb-3 shadow-md border transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                      <img
                        src={posterUrl}
                        alt={itemTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <h3 className={`text-sm font-bold truncate px-1 transition-colors ${darkMode ? "group-hover:text-indigo-400 text-gray-200" : "group-hover:text-indigo-600 text-gray-900"}`}>
                      {itemTitle}
                    </h3>
                    <p className={`text-[9px] font-bold uppercase tracking-widest px-1 mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                      {item.character ? `${item.character.slice(0, 15)} • ` : ""}{isNaN(releaseYear) ? "N/A" : releaseYear}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
