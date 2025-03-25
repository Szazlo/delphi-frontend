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
    const [myRequests, setMyRequests] = useState<Request[]>([]);
    const [assignedRequests, setAssignedRequests] = useState<Request[]>([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const roles = localStorage.getItem('roles');

    useEffect(() => {
        const fetchMyRequests = async () => {
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
                setMyRequests(data);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        const fetchAssignedRequests = async () => {
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
                setAssignedRequests(data);
            } catch (error) {
                console.error((error as Error).message);
            }
        }

        fetchMyRequests();
        fetchAssignedRequests();
    }, [token, userId, roles]);

    const renderRequestTable = (requests: Request[], caption: string, emptyMessage: string) => (
        <Table className="text-white">
            {requests.length === 0 ? (
                <TableCaption>{emptyMessage}</TableCaption>
            ) : (
                <TableCaption>{caption}</TableCaption>
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
                    <TableRow
                        key={request.id}
                        onClick={() => navigate(`/results/${request.id}`)}
                        className="cursor-pointer hover:bg-gray-800"
                    >
                        <TableCell>{request.fileName}</TableCell>
                        <TableCell>{request.assignment.title}</TableCell>
                        <TableCell>{request.status}</TableCell>
                        <TableCell>{new Date(Number(request.timestamp)).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <>
            <div className="flex w-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col w-full">
                    <Topbar />
                    <div className="p-4">
                        <h1 className="text-gray-300 text-2xl">Requests</h1>
                        <p className="text-gray-400">View and manage your review requests</p>
                    </div>
                    <div className="flex flex-col w-full space-y-8 p-4 justify-start items-start">
                        <div className="w-full">
                            <h2 className="text-xl font-semibold text-gray-300 mb-4">My Review Requests</h2>
                            <div className="w-full overflow-x-auto">
                                {renderRequestTable(
                                    myRequests,
                                    "Reviews requested by me",
                                    "You haven't requested any reviews"
                                )}
                            </div>
                        </div>

                        <div className="w-full">
                            <h2 className="text-xl font-semibold text-gray-300 mb-4">Assigned To Me</h2>
                            <div className="w-full overflow-x-auto">
                                {renderRequestTable(
                                    assignedRequests,
                                    "Reviews assigned to me",
                                    "The are no reviews assigned to you yet"
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Requests;