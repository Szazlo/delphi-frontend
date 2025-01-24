import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/Api/auth";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Results", path: "/results" },
        { label: "Settings", path: "/settings" },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="h-screen w-44 bg-background-contrast text-gray-300 flex flex-col justify-between p-4 shadow-lg shadow-shadow-box">
            <div>
                <h1
                    onClick={() => navigate('/')}
                    className="text-2xl bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent mb-4 cursor-pointer"
                >
                    Delphi
                </h1>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(({ label, path }) => (
                        <a
                            key={path}
                            onClick={() => navigate(path)}
                            className={`cursor-pointer text-gray-400 hover:text-gray-100 ${isActive(path) ? 'text-white' : ''}`}
                        >
                            {label}
                        </a>
                    ))}
                </nav>
            </div>
            <a onClick={handleLogout} className="text-error hover:text-error-light cursor-pointer">
                Logout
            </a>
        </div>
    );
};

export default Sidebar;
