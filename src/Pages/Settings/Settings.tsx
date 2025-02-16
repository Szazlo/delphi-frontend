import {useState, useEffect} from 'react';
import Sidebar from "@/Components/Sidebar.tsx";
import {Buffer} from 'buffer';
import UserManagementTable from "@/Components/UserManagementTable.tsx";

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
                const {userId, userDetails, roles} = decodeToken(token);
                setUserId(userId);
                setUserDetails(userDetails);
                setRoles(roles);
                if (roles.includes('admin')) {
                    fetchUsers();
                }
                userDetails.profilePicture = localStorage.getItem('profilePicture') || userDetails.profilePicture;
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
            const usersWithManagerStatus = await Promise.all(data.map(async (user: any) => {
                const managerResponse = await fetch(`http://localhost:8080/api/auth/manager/${user.id}`, {
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
            const response = await fetch(`http://localhost:8080/api/auth/update/${userId}`, {
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
            alert('User details updated successfully. Please log in again to see the changes.');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleProfilePictureChange = async () => {
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/users/pfp/${userId}`, {
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
            alert('Profile picture updated successfully.');
            // You can update localStorage here if necessary
            localStorage.setItem('profilePicture', userDetails.profilePicture);
        } catch (error) {
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
        <>
            <div className="flex w-screen">
                <Sidebar/>
                <div className="flex flex-col w-full justify-start items-center p-4">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-white mb-4">Manage your account settings</p>
                    <div className="flex items-start justify-center w-full max-w-4xl space-x-8">
                        <form onSubmit={handleSubmit} className="w-1/2">
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
                        <div className="w-1/4 flex flex-col items-center">
                            <img src={userDetails.profilePicture || "https://placehold.co/150"} alt="Profile Picture"
                                 className="w-32 h-32 rounded-full mb-4"/>
                            <div className="mb-4">
                                <label className="block text-white text-sm font-bold mb-2" htmlFor="profilePicture">
                                    Profile Picture URL
                                </label>
                                <input
                                    type="text"
                                    id="profilePicture"
                                    name="profilePicture"
                                    value={userDetails.profilePicture}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <button
                                onClick={handleProfilePictureChange}
                                className="h-min bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Update
                            </button>
                        </div>
                    </div>
                    {roles.includes('admin') && (
                        <div className="w-full max-w-4xl mt-8 text-white">
                            <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
                            <input
                                type="text"
                                placeholder="Search users"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-4 p-2 rounded border border-gray-300 text-black"
                            />
                            <div className="overflow-y-scroll h-96">
                                <UserManagementTable users={filteredUsers}/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Settings;