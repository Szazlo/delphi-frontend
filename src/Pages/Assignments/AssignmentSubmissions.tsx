import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionService } from '@/Api/submissionService';
import { toast } from "sonner";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ReactMarkdown from 'react-markdown';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/Components/ui/card";

interface Submission {
    id: string;
    userId: string;
    fileName: string;
    output: string;
    runtime: number;
    memory: number;
    timestamp: string;
    status: string;
    testResults: string;
    aiOutput: string;
}

export function AssignmentSubmissions() {
    const { id: assignmentId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!assignmentId) return;
            
            try {
                setLoading(true);
                const data = await submissionService.getSubmissionsForAssignment(assignmentId);
                setSubmissions(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                toast.error("Failed to fetch submissions");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [assignmentId]);

    const handleAnalyze = async () => {
        if (!assignmentId) return;
        
        try {
            setAnalyzing(true);
            const data = await submissionService.analyzeSubmissions(assignmentId);
            setAnalysis(data);
        } catch (error) {
            console.error('Error analyzing submissions:', error);
            toast.error("Failed to analyze submissions");
        } finally {
            setAnalyzing(false);
        }
    };

    const renderStatus = (status: string) => {
        const statusColors = {
            'Completed': 'text-green-500',
            'Failed': 'text-red-500',
            'Running': 'text-yellow-500'
        };

        return (
            <span className={`font-semibold ${statusColors[status as keyof typeof statusColors] || 'text-gray-500'}`}>
                {status === 'Running' && <AiOutlineLoading3Quarters className="inline-block animate-spin mr-1" />}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No submissions found for this assignment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                    Submissions ({submissions.length})
                </h2>
                <Button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {analyzing ? (
                        <>
                            <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Submissions'
                    )}
                </Button>
            </div>
            
            <div className="rounded-md border border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-white bg-opacity-10 hover:bg-opacity-10">
                            <TableHead className="text-white">User</TableHead>
                            <TableHead className="text-white">Submitted At</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => (
                            <TableRow 
                                key={submission.id} 
                                className="cursor-pointer hover:bg-white hover:bg-opacity-10"
                                onClick={() => navigate(`/results/${submission.id}`)}
                            >
                                <TableCell className="text-gray-300">{submission.userId}</TableCell>
                                <TableCell className="text-gray-300">
                                    {new Date(Number(submission.timestamp)).toLocaleString()}
                                </TableCell>
                                <TableCell>{renderStatus(submission.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {analysis && (
                <Card className="p-4 bg-white bg-opacity-5 mt-4">
                    <h3 className="text-xl font-bold text-white mb-4">Submission Analysis</h3>
                    <div className="prose prose-invert max-w-none [&>h2]:mt-8 [&>h3]:mt-6 [&>p]:mt-4 [&>ul]:mt-4 [&>ol]:mt-4 [&>pre]:mt-4">
                        <ReactMarkdown className="text-gray-300">{analysis}</ReactMarkdown>
                    </div>
                </Card>
            )}
        </div>
    );
} 