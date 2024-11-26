import { StrictMode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard'
import Results from './Pages/Results/Results'
import PrivateRoute from "@/Pages/PrivateRoute.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Landing/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/dashboard/*" element={<PrivateRoute component={Dashboard} />} />
                <Route path="/results" element={<PrivateRoute component={Results} />} />
                <Route path="/results/:id" element={<PrivateRoute component={Results} />} /> {/* Dynamic Route */}
            </Routes>
        </Router>
    </StrictMode>,
)