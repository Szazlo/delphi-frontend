import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import Sidebar from "@/Components/Sidebar";
import Topbar from "@/Components/Topbar";

interface Request {
    id: string;
    fileName: string;
    status: string;
    language: string;
    timestamp: string;
    assignment: {
        title: string;
    };
}

function Requests() {
    const [requests, setRequests] = useState<Request[]>([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const roles = localStorage.getItem('roles');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const url = `http://localhost:8080/api/submissions/user/${userId}?withReviewRequests=true`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await response.json();
                setRequests(data);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        const fetchReviewerRequests = async () => {
            try {
                const url = `http://localhost:8080/api/submissions/reviewer/${userId}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await response.json();
                setRequests(prevRequests => {
                    const newRequests = data.filter((request: Request) => !prevRequests.some(r => r.id === request.id));
                    return [...prevRequests, ...newRequests];
                });
            } catch (error) {
                console.error((error as Error).message);
            }
        }

        fetchRequests();
        fetchReviewerRequests();
    }, [token, userId, roles]);



    return (
        <>
            <div className="flex w-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col w-full">
                    <Topbar />
                    <div className="flex flex-col w-full space-y-4 p-4 justify-start items-start">
                        <h1 className="text-gray-300 text-2xl text-center">Review Requests</h1>
                        <div className="w-full overflow-x-auto">
                            <Table className="text-white">
                                {requests.length === 0 && (
                                    <TableCaption>No requests</TableCaption>
                                ) || (
                                    <TableCaption>List of review requests</TableCaption>
                                )}
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(request => (
                                        <TableRow key={request.id} onClick={() => navigate(`/results/${request.id}`)} className="cursor-pointer hover:bg-gray-800">
                                            <TableCell>{request.fileName}</TableCell>
                                            <TableCell>{request.assignment.title}</TableCell>
                                            <TableCell>{request.status}</TableCell>
                                            <TableCell>{new Date(Number(request.timestamp)).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Requests;