import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/Api/auth';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials.username, credentials.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error && err.message === '401' ? 'Invalid username or password' : 'An unknown error occurred');
        }
    };

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-zinc-800 rounded-lg p-6 shadow-lg shadow-lingrad2 flex flex-col items-center justify-evenly">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                <form className="mt-4 w-full" onSubmit={handleSubmit}>
                    {['username', 'password'].map((field) => (
                        <div key={field} className="mb-4">
                            <input
                                type={field}
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={credentials[field as keyof typeof credentials]}
                                onChange={handleChange}
                                className="p-2 rounded-lg bg-black text-white border-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                    <p className="text-sm text-right text-gray-400">Forgot password?</p>
                    {error && <p className="text-error">{error}</p>}
                    <div className="flex flex-col justify-center items-center">
                        <button type="submit" className="w-1/2 my-4 bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 border-none">
                            Login
                        </button>
                        <p className="text-sm text-gray-400">Don't have an account?</p>
                        <button type="button" className="bg-transparent text-gray-300 hover:bg-gray-500 hover:bg-opacity-20 border-none" onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
