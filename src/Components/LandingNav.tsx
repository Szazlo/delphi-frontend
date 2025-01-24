import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    showButtons: boolean;
}

const Navbar = ({ showButtons }: NavbarProps) => {
    const [isLoggedIn] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    const navigateTo = (path: string) => navigate(path);

    return (
        <nav className="flex justify-between items-center p-6 text-white">
            <h1
                onClick={() => navigateTo('/')}
                className="text-2xl bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent cursor-pointer"
            >
                Delphi
            </h1>
            {showButtons && (
                <div>
                    {isLoggedIn ? (
                        <button
                            onClick={() => navigateTo('/dashboard')}
                            className="bg-transparent border-gray-600 text-white px-4 py-2 rounded-lg border-2"
                        >
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigateTo('/login')}
                                className="mr-4 bg-transparent border-gray-600 border-2 px-4 py-2 rounded-lg text-white"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigateTo('/register')}
                                className="bg-gradient-to-br from-lingrad via-lingrad2 to-lingrad3 text-white px-4 py-2 rounded-lg"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
