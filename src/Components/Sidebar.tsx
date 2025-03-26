import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/Api/auth";
import { MessageCircleQuestion } from 'lucide-react';
import HelpDialog from "@/Components/HelpDialog.tsx";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const roles = localStorage.getItem('roles');

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Groups", path: "/groups" },
        { label: "Assignments", path: "/assignments" },
        { label: "Results", path: "/results" },
        { label: "Requests", path: "/requests" },
        { label: "Settings", path: "/settings" },
    ];

    // if (roles?.includes('admin') || roles?.includes('manager')) {
    //     navItems.splice(1, 0, { label: "Requests", path: "/requests" });
    // }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="h-screen w-44 bg-background-contrast text-gray-300 flex flex-col justify-between p-4 shadow-lg shadow-shadow-box w-min">
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
            <div className="flex flex-col space-y-2">
                <HelpDialog />
                <a onClick={handleLogout} className="text-error hover:text-error-light cursor-pointer">
                    Logout
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
