import {useState, useEffect} from 'react';
import Sidebar from "@/Components/Sidebar.tsx";
import {Buffer} from 'buffer';
import { toast } from "sonner"
import UserManagementTable from "@/Components/UserManagementTable.tsx";
import { AIConfigurationSection } from './AIConfigurationSection';
import API_URL from "@/Api/APIConfig.tsx";

interface UserDetails {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profilePicture: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    isManager: boolean;
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
            profilePicture: decodedPayload.profile_picture || '',
        },
        roles: decodedPayload.realm_access.roles
    };
}

function Settings() {
    const [userDetails, setUserDetails] = useState<UserDetails>({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [roles, setRoles] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const {userId: id, userDetails: details, roles: userRoles} = decodeToken(token);
                setUserId(id);
                setUserDetails(details);
                setRoles(userRoles);
                if (userRoles.includes('admin')) {
                    fetchUsers();
                }
                details.profilePicture = localStorage.getItem('profilePicture') || details.profilePicture;
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
            const response = await fetch(`${API_URL}/auth/getUsers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            const usersWithManagerStatus = await Promise.all(data.map(async (user: any) => {
                const managerResponse = await fetch(`${API_URL}/auth/manager/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const isManager = await managerResponse.json();
                return {
                    ...user,
                    isManager
                };
            }));
            setUsers(usersWithManagerStatus);
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setUserDetails(prevDetails => ({...prevDetails, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const {profilePicture, ...detailsToUpdate} = userDetails; // Exclude profilePicture from the update request
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(detailsToUpdate) // Send only user details without profile picture
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user details');
            }
            toast.success('Changes saved. Log out and log back in to see the changes.');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleProfilePictureChange = async () => {
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/pfp/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({pfp: userDetails.profilePicture}) // Only update the profile picture
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile picture');
            }
            toast.success('Profile picture updated successfully');
            localStorage.setItem('profilePicture', userDetails.profilePicture);
        } catch (error) {
            toast.error('Failed to update profile picture');
            setError((error as Error).message);
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="flex w-screen h-screen">
            <Sidebar/>
            <div className="flex flex-col w-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold mb-4 text-white">Settings</h1>
                            {error && <p className="text-red-500 mb-4">{error}</p>}
                        </div>

                        <div className="bg-white bg-opacity-5 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 text-white">Personal Information</h2>
                            <div className="flex gap-8">
                                <form onSubmit={handleSubmit} className="flex-1">
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
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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

                                <div className="w-1/3 flex flex-col items-center justify-end">
                                    <img 
                                        src={userDetails.profilePicture || "https://placehold.co/150"} 
                                        alt="Profile Picture"
                                        className="w-32 h-32 rounded-full mb-4 bg-white"
                                    />
                                    <div className="w-full mb-4">
                                        <label className="block text-white text-sm font-bold mb-2" htmlFor="profilePicture">
                                            Profile Picture URL
                                        </label>
                                        <input
                                            type="text"
                                            id="profilePicture"
                                            name="profilePicture"
                                            value={userDetails.profilePicture}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleProfilePictureChange}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    >
                                        Update Picture
                                    </button>
                                </div>
                            </div>
                        </div>

                        {(roles.includes('manager') || roles.includes('admin'))  && (
                            <div className="bg-white bg-opacity-5 p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
                                <input
                                    type="text"
                                    placeholder="Search users"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mb-4 p-2 rounded border border-gray-300 bg-white text-gray-700"
                                />
                                <div className="overflow-y-auto max-h-96">
                                    <UserManagementTable users={filteredUsers}/>
                                </div>
                            </div>
                        )}

                        {roles.includes('admin') && (
                            <div className="bg-white bg-opacity-5 p-6 rounded-lg shadow-md">
                                <AIConfigurationSection />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;