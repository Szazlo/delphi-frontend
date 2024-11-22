import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    showButtons: boolean;
}

const Navbar = ({ showButtons }: NavbarProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <nav className="flex justify-between items-center p-6 text-white align-middle">
            <h1 className="text-2xl bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent">Delphi</h1>
            {showButtons ? (
                <div>
                    {isLoggedIn ? (
                        <button
                            onClick={handleDashboard}
                            className="bg-transparent border-gray-600 text-white px-4 py-2 rounded-lg border-2">
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleLogin}
                                className="mr-4 bg-transparent border-gray-600 border-2 px-4 py-2 rounded-lg text-white">
                                Login
                            </button>
                            <button
                                onClick={handleSignUp}
                                className="bg-gradient-to-br from-lingrad via-lingrad2 to-lingrad3 text-white px-4 py-2 rounded-lg border-0">
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="py2" style={{ height: "44px" }}/>
            )}
        </nav>
    );
};

export default Navbar;