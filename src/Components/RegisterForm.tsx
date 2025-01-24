import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '@/Api/auth';

const RegisterForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData.username, formData.password, formData.email);
            await login(formData.username, formData.password);
            navigate('/dashboard');
        } catch {
            setError('Registration failed');
        }
    };

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-zinc-800 rounded-lg p-6 shadow-lg shadow-lingrad2 flex flex-col items-center justify-evenly">
                <h1 className="text-2xl font-bold text-center">Register</h1>
                <form className="mt-4 w-full" onSubmit={handleSubmit}>
                    {['username', 'password', 'email'].map(field => (
                        <div key={field} className="mb-4">
                            <input
                                type={field === 'password' ? 'password' : 'text'}
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field as keyof typeof formData]}
                                onChange={handleChange}
                                className="p-2 rounded-lg bg-black text-white border-none w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                    {error && <p className="text-error">{error}</p>}
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="w-1/2 bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 border-none">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
