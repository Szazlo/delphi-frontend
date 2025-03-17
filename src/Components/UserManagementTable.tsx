import {useEffect, useState} from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    isManager: boolean;
}

interface UserTableProps {
    users: User[];
}


const UserManagementTable: React.FC<UserTableProps> = ({ users: initialUsers }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);

    // Sync state when new users are received
    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleCheckboxChange = async (userId: string, isChecked: boolean) => {
        const url = `http://localhost:8080/api/auth/manager/${userId}`;
        const method = isChecked ? 'POST' : 'DELETE';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update manager status');
            }

            // Update the state to reflect the change
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, isManager: isChecked } : user
                )
            );
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    return (
        <Table className="text-white">
            <TableCaption>A list of users</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-36">First Name</TableHead>
                    <TableHead className="w-36">Last Name</TableHead>
                    <TableHead className="w-36">Username</TableHead>
                    <TableHead className="w-36">Email</TableHead>
                    <TableHead className="w-36">Is Lecturer</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <input
                                type="checkbox"
                                checked={user.isManager}
                                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                                onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default UserManagementTable;