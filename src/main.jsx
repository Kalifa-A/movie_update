import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
<<<<<<< HEAD
import { DarkModeProvider } from './Context/DarkModeContext'
=======
>>>>>>> d2ed0de127d2452967592c64552a51cfd013efa4
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
<<<<<<< HEAD
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </BrowserRouter>
=======
      <App />
  </BrowserRouter>
 
>>>>>>> d2ed0de127d2452967592c64552a51cfd013efa4
)
