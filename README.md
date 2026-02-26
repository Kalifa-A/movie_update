# Liquid Cinema

A premium, high-end movie discovery and library platform inspired by the **Apple TV+** and **Liquid Design** aesthetic. Built with a focus on fluid motion, glassmorphism, and a "mobile-first" cinematic experience.



---

## Key Features

* **Liquid UI:** A "thumb-friendly" mobile experience featuring horizontal snap-scrolling and sticky action bars.
* **Ambient Video Player:** A custom YouTube integration featuring Siri-style ambient glows and branding overlays.
* **Dynamic Collection:** Full Watchlist functionality (Add/Remove) with immediate state updates for a "liquid" feel.
* **Responsive Glassmorphism:** Adaptive UI that transitions from a minimal mobile layout to a rich, frosted-glass desktop experience.
* **Smart Search & Discovery:** Integrated with TMDB API for real-time movie data, cast details, and related recommendations.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Framer Motion |
| **Routing** | React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **API** | TMDB (The Movie Database) |
| **Icons/Assets** | Custom SVG + Apple San Francisco inspired typography |

---

## Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/liquid-cinema.git](https://github.com/your-username/liquid-cinema.git)
cd liquid-cinema

2. Install Dependencies
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

3. Environment Variables
Frontend (.env):
VITE_API_URL=http://localhost:5000/api

Backend (.env):
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
TMDB_API_KEY=your_tmdb_key
4. Run the Project
# Start backend (from /server)
npm start

# Start frontend (from root)
npm run dev

---
## Created By
 Kalifa "Front-End Developer & UI/UX Designer
Building the next generation of liquid digital experiences.
