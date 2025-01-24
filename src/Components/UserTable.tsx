import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    roles: string[];
}

interface UserTableProps {
    users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
    return (
        <Table>
            <TableCaption>A list of users</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-28">First Name</TableHead>
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
                        <TableCell>{user.roles.includes('manager') ? 'true' : 'false'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default UserTable;