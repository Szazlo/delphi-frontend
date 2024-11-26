import { useNavigate, useLocation } from "react-router-dom";
import {logout} from "@/Api/auth";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="h-screen w-44 bg-background-contrast text-gray-300 flex flex-col justify-between p-4 shadow-lg shadow-shadow-box">
            <div>
                <h1 className="text-2xl bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent mb-4">Delphi</h1>
                <nav className="flex flex-col space-y-2">
                    <a onClick={() => navigate('/dashboard')} className={`text-gray-400 hover:text-gray-100 ${isActive('/dashboard') ? 'text-gray-100' : ''}`}>
                        Dashboard
                    </a>
                    <a onClick={() => navigate('/results')} className={`text-gray-400 hover:text-gray-100 ${isActive('/results') ? 'text-gray-100' : ''}`}>
                        Results
                    </a>
                    <a onClick={() => navigate('/settings')} className={`text-gray-400 hover:text-gray-100 ${isActive('/settings') ? 'text-gray-100' : ''}`}>
                        Settings
                    </a>
                </nav>
            </div>

            <div>
                <a onClick={() => {
                    logout().then(() => navigate('/'));
                }} className="text-error hover:text-error-light">Logout</a>
            </div>
        </div>
    );
}

export default Sidebar;