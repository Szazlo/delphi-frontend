import { useState, useEffect } from 'react';
import Sidebar from "@/Components/Sidebar.tsx";
import { Buffer } from 'buffer';
import UserTable from "@/Components/UserTable";

interface UserDetails {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    roles: string[];
}

function decodeToken(token: string): { userId: string, userDetails: UserDetails, roles: string[] } {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return {
        userId: decodedPayload.sub,
        userDetails: {
            firstName: decodedPayload.given_name,
            lastName: decodedPayload.family_name,
            username: decodedPayload.preferred_username,
            email: decodedPayload.email,
        },
        roles: decodedPayload.realm_access.roles
    };
}

function Settings() {
    const [userDetails, setUserDetails] = useState<UserDetails>({ firstName: '', lastName: '', username: '', email: '' });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [roles, setRoles] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { userId, userDetails, roles } = decodeToken(token);
                setUserId(userId);
                setUserDetails(userDetails);
                setRoles(roles);
                if (roles.includes('admin')) {
                    fetchUsers();
                }
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/auth/getUsers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            console.log(data);
            setUsers(data.map((user: any) => ({
                ...user,
                roles: user.roles || []
            })));
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserDetails(prevDetails => ({ ...prevDetails, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/auth/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(userDetails)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user details');
            }
            alert('User details updated successfully. Please log in again to see the changes.');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            <div className="flex w-screen">
                <Sidebar />
                <div className="flex flex-col w-full justify-start items-center p-4">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-white mb-4">Manage your account settings</p>
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="mb-4 flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-white text-sm font-bold mb-2" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={userDetails.firstName}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-white text-sm font-bold mb-2" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={userDetails.lastName}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={userDetails.username}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userDetails.email}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                    {roles.includes('admin') && (
                        <div className="w-full max-w-4xl mt-8 text-white">
                            <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
                            <UserTable users={users} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Settings;