import { StrictMode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard'
import Results from './Pages/Results/Results'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Router>
          <Routes>
              <Route path="/" element={<Landing/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="/results" element={<Results/>}/>
              <Route path="/results/:id" element={<Results />} /> {/* Dynamic Route */}
          </Routes>
      </Router>
  </StrictMode>,
)
