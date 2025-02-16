import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import AssignmentCard from "@/Components/AssignmentCard.tsx";
import AssignmentDialog from "@/Components/AssignmentDialog.tsx";
import FileUploadDialogue from "@/Components/FileUploadDialogue.tsx";
import ReactMarkdown from "react-markdown";

interface Group {
    id: string;
    name: string;
}

interface Assignment {
    dueDate: string | null;
    id: string;
    group_id: string;
    title: string;
    description: string;
    timeLimit: number;
    memoryLimit: number;
    maxScore: number;
}

interface Submission {
    id: string;
    assignment: {
        id: string;
    };
    userId: string;
    fileUrl: string;
    createdAt: string;
}

function Assignments() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const groupsResponse = await fetch(`http://localhost:8080/api/groups/${userId}/groups`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!groupsResponse.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const groups: Group[] = await groupsResponse.json();

                const assignmentsPromises = groups.map(async (group) => {
                    const assignmentsResponse = await fetch(`http://localhost:8080/api/assignments/group/${group.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!assignmentsResponse.ok) {
                        throw new Error(`Failed to fetch assignments for group ${group.id}`);
                    }
                    return assignmentsResponse.json();
                });

                const assignmentsArray = await Promise.all(assignmentsPromises);
                const allAssignments = assignmentsArray.flat();
                setAssignments(allAssignments);

                if (id) {
                    const assignment = allAssignments.find(a => a.id === id);
                    setSelectedAssignment(assignment || null);
                }
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        const fetchSubmissions = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/submissions/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                const submissionsData: Submission[] = await response.json();
                setSubmissions(submissionsData);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        fetchAssignments();
        fetchSubmissions();
    }, [token, userId, id]);

    const handleSelectAssignment = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowAssignmentDialog(true);
        navigate(`/assignments/${assignment.id}`);
    };

    const handleSaveAssignment = (assignment: Assignment, group_id: string) => {
        setAssignments(prevAssignments => {
            const index = prevAssignments.findIndex(a => a.id === assignment.id);
            if (index !== -1) {
                const updatedAssignments = [...prevAssignments];
                updatedAssignments[index] = assignment;
                return updatedAssignments;
            }
            return [...prevAssignments, assignment];
        });
        setShowAssignmentDialog(false);
    };

    const handleCloneAssignment = async (assignment: Assignment) => {
        const token = localStorage.getItem('token');
        const formattedDueDate = assignment.dueDate ? new Date(assignment.dueDate).toISOString().replace('T', ' ').replace('Z', '') : null;
        const formattedData = {
            title: `${assignment.title} (Copy)`,
            description: assignment.description,
            time_limit: assignment.timeLimit,
            memory_limit: assignment.memoryLimit,
            due_date: formattedDueDate,
            max_score: assignment.maxScore,
            group_id: assignment.group_id,
        };
        const url = 'http://localhost:8080/api/assignments';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formattedData),
        });
        if (!response.ok) {
            throw new Error('Failed to clone assignment');
        }
        const data = await response.json();
        setAssignments(prevAssignments => [...prevAssignments, data]);
    };

    const hasSubmission = (assignmentId: string) => {
        // if any of the submission's assignment -> id matches the assignmentId return true
        return submissions.some(submission => submission.assignment.id === assignmentId);
    };

    return (
        <div className="flex w-screen">
            <Sidebar />
            <div className="flex flex-col w-full">
                <Topbar />
                <div className="p-4">
                    {id && selectedAssignment ? (
                        <div className="flex flex-col">
                            <div className="flex justify-end">
                                <AssignmentDialog
                                    groupId={selectedAssignment.group_id}
                                    assignment={selectedAssignment}
                                    onSave={handleSaveAssignment}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl text-gray-300">{selectedAssignment.title}</h1>
                                <div className="flex flex-col items-end">
                                    <p className="text-gray-300">Marks Available: {selectedAssignment.maxScore}</p>
                                    {selectedAssignment.dueDate && (
                                        <p className="text-gray-300">Due Date: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-300">Time Limit: {selectedAssignment.timeLimit}s | Memory Limit: {selectedAssignment.memoryLimit || "n/a "}KB</p>
                            <hr className="my-4 border-gray-600" />
                            <ReactMarkdown className="text-gray-300">{selectedAssignment.description}</ReactMarkdown>
                            <div className="flex justify-end my-4">
                                <div className="flex flex-col items-end">
                                    {hasSubmission(selectedAssignment.id) && (
                                        <p className="text-success">Assignment submitted!<br/>Submit again to update
                                            your submission.</p>
                                    )}
                                    <div className="flex items-center">
                                        {hasSubmission(selectedAssignment.id) && (
                                    <button onClick={() => navigate(`/results/${submissions.find(submission => submission.assignment.id === selectedAssignment.id)?.id}`)}
                                        className="bg-success bg-opacity-80 rounded-lg shadow-md hover:bg-opacity-60 transition duration-300 cursor-pointer text-white">
                                        View Submission
                                    </button>
                                )}
                                    <FileUploadDialogue token={token} assignmentId={selectedAssignment.id} onSubmission={() => {}}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center my-4">
                                <h1 className="text-2xl text-gray-300">Assignments</h1>
                                <AssignmentDialog groupId={id} onSave={(assignment: Assignment, groupId: string) => {
                                    if (groupId === id) {
                                        setAssignments([...assignments, assignment]);
                                    }
                                }} />
                            </div>
                            <ul className="space-y-4">
                                {assignments.length > 0 ? (
                                    assignments.map((assignment) => (
                                        <AssignmentCard
                                            key={assignment.id}
                                            title={assignment.title}
                                            dueDate={assignment.dueDate}
                                            maxScore={assignment.maxScore}
                                            onClick={() => handleSelectAssignment(assignment)}
                                            onClone={() => handleCloneAssignment(assignment)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-300">There are no assignments currently.</p>
                                )}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Assignments;