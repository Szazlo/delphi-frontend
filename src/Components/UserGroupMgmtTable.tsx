import { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    inGroup: boolean;
}

interface UserGroupMgmtTableProps {
    groupId: string;
    initialUsers: User[];
}

const UserGroupMgmtTable: React.FC<UserGroupMgmtTableProps> = ({ groupId, initialUsers }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleCheckboxChange = async (userId: string, isChecked: boolean) => {
        const url = `http://localhost:8080/api/groups/${groupId}/users${isChecked ? `?userId=${userId}` : `/${userId}`}`;
        const method = isChecked ? 'POST' : 'DELETE';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: isChecked ? JSON.stringify({ userId }) : undefined
            });

            if (!response.ok) {
                throw new Error('Failed to update user group status');
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, inGroup: isChecked } : user
                )
            );
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleSelectAllChange = async (isChecked: boolean) => {
        //alert the user that this will affect all users in the group
        if (!window.confirm(`This action will update all the users in the (filtered) table.\nDo you want to proceed?`)) {
            return;
        }
        setSelectAll(isChecked);
        const updatedUsers = users.map(user => ({ ...user, inGroup: isChecked }));
        setUsers(updatedUsers);

        for (const user of users) {
            await handleCheckboxChange(user.id, isChecked);
        }
    };

    return (
        <Table className="text-white">
            <TableCaption>Manage users in group</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-36">First Name</TableHead>
                    <TableHead className="w-36">Last Name</TableHead>
                    <TableHead className="w-36">Username</TableHead>
                    <TableHead className="w-36">Email</TableHead>
                    <TableHead className="w-36">
                        In Group
                        <input
                            type="checkbox"
                            checked={selectAll}
                            className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                            onChange={(e) => handleSelectAllChange(e.target.checked)}
                        />
                    </TableHead>
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
                                checked={user.inGroup}
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

export default UserGroupMgmtTable;