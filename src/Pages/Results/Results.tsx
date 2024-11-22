import './Results.css'
import {useNavigate, useParams} from 'react-router-dom'
import { useState, useEffect } from 'react'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Textarea } from "@/Components/ui/textarea"

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";

interface Result {
    id: string;
    fileName: string;
    status: string;
    output: string;
    language: string;
    runtime: string;
    memory: string;
    timestamp: string;
}

function Results() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [results, setResults] = useState<Result[]>([])
    const [specificResult, setSpecificResult] = useState<Result | null>(null)

    const fetchResults = async () => {
        try {
            const userId = localStorage.getItem('userId')
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error('Error fetching results:', error)
        }
    }

    const fetchSpecificResult = async (submissionId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (!response.ok) {
                console.error('Error fetching specific result:', data)
                return
            }
            setSpecificResult(data)
        } catch (error) {
            console.error('Error fetching specific result:', error)
        }
    }

    useEffect(() => {
        if (id) {
            fetchSpecificResult(id)
        } else {
            fetchResults()
        }
    }, [id])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Complete':
                return 'text-green-500';
            case 'Pending':
                return 'text-gray-500';
            case 'Running':
                return 'text-amber-500';
            case 'Failed':
                return 'text-error';
            default:
                return '';
        }
    };

    function convertTimestampToDateTime(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    return (
        <>
            <div className="flex w-screen">
                <Sidebar/>
                <div className="flex flex-col w-full">
                    <Topbar/>
                    {id && specificResult ? (
                        <div className="flex flex-col mx-4 text-white">
                            <div className="flex flex-col">
                                <h2 className="text-lg">Results for {specificResult.fileName}</h2>
                                <div className="flex justify-start mb-4">
                                    <p className={`text-sm ${getStatusColor(specificResult.status)}`}>{specificResult.status}</p>
                                    <p className="text-sm ml-4">{convertTimestampToDateTime(parseInt(specificResult.timestamp))}</p>
                                    <p className="text-sm ml-4">{specificResult.language}</p>
                                    <p className="text-sm ml-4">Runtime: {specificResult.runtime}</p>
                                    <p className="text-sm ml-4">Memory: {specificResult.memory}</p>
                                </div>
                                <Textarea className="h-96" value={specificResult.output} readOnly />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mx-4 text-white">
                            <Table>
                                <TableCaption>A list of your previous submissions</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-28">Name</TableHead>
                                        <TableHead className="w-36">Status</TableHead>
                                        <TableHead className="w-36">Language</TableHead>
                                        <TableHead className="w-36"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{result.fileName}</TableCell>
                                            <TableCell className={`font-semibold ${getStatusColor(result.status)}`}>{result.status}</TableCell>
                                            <TableCell>{result.language}</TableCell>
                                            <TableCell>
                                                {result.status !== 'Pending' && result.status !== 'Running' && (
                                                    <button className="border-2 border-gray-600 bg-transparent px-2 py-1 rounded hover:border-gray-700" onClick={() => navigate(`/results/${result.id}`)}>
                                                        View
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Results