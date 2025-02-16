import { StrictMode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import Dashboard from './Pages/Dashboard/Dashboard'
import Results from './Pages/Results/Results'
import Settings from './Pages/Settings/Settings'
import PrivateRoute from "@/Pages/PrivateRoute.tsx";
import Groups from "@/Pages/Groups/Groups.tsx";
import Assignments from "@/Pages/Assignments/Assignments.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Landing/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/dashboard/*" element={<PrivateRoute component={Dashboard} />} />
                <Route path="/requests" element={<PrivateRoute component={Dashboard} />} />
                <Route path="/groups" element={<PrivateRoute component={Groups} />} />
                <Route path="/groups/:id" element={<PrivateRoute component={Groups} />} /> {/* Dynamic Route */}
                <Route path="/assignments" element={<PrivateRoute component={Assignments} />} />
                <Route path="/assignments/:id" element={<PrivateRoute component={Assignments} />} /> {/* Dynamic Route */}
                <Route path="/results" element={<PrivateRoute component={Results} />} />
                <Route path="/results/:id" element={<PrivateRoute component={Results} />} /> {/* Dynamic Route */}
                <Route path="/settings" element={<PrivateRoute component={Settings} />} />
            </Routes>
        </Router>
    </StrictMode>,
)