// src/Components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/Api/auth';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errormsg, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const token = await login(username, password);
            localStorage.setItem('token', token);
            // parse token to get user id
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('userId', payload.sub);
            localStorage.setItem('name', payload.name);
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                setError('Invalid credentials');
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-zinc-800 rounded-lg p-6 shadow-lg shadow-lingrad2 flex flex-col items-center justify-evenly">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                <form className="mt-4 w-full" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-2 rounded-lg bg-black text-white border-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-2 rounded-lg bg-black text-white border-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <p className="text-sm text-right text-gray-400">Forgot password?</p>
                    {errormsg && <p className="text-error">{errormsg}</p>}
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="w-1/2 bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 border-none">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;