import './Dashboard.css'

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import {useEffect, useState} from "react";
import GroupCard from "@/Components/GroupCard.tsx";
import AssignmentCard from "@/Components/AssignmentCard.tsx";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/Components/ui/carousel";
import JoinGroupDialog from "@/Components/JoinGroupDialog.tsx";
import { toast } from "sonner";

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
}

interface Assignment {
    dueDate: string | null;
    id: string;
    group_id: string;
    group: Group;
    title: string;
    description: string;
    timeLimit: number;
    memoryLimit: number;
    maxScore: number;
}

function Dashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [showJoinGroupDialog, setShowJoinGroupDialog] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const userRole = localStorage.getItem('roles');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/groups/${userId}/groups`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

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
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        fetchGroups();
        fetchAssignments();
    }, [token, userId]);

    const handleSelectAssignment = (assignment: Assignment) => {
        navigate(`/assignments/${assignment.id}`);
    };

    const handleJoinGroup = async (groupId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/users?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 404) {
                toast.error('Group not found');
                setError('Group not found');
                return;
            }

            if (!response.ok) {
                toast.error('Failed to join group');
                throw new Error('Failed to join group');
            }

            // Refresh groups after successfully joining
            const groupsResponse = await fetch(`http://localhost:8080/api/groups/${userId}/groups`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (groupsResponse.ok) {
                const data = await groupsResponse.json();
                setGroups(data);
                toast.success('Successfully joined group!');
            }

            setShowJoinGroupDialog(false);
            setError(null);
        } catch (error) {
            setError((error as Error).message);
        }
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
            group_id: assignment.group.id,
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

    return (
        <>
            <div className="flex w-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col w-full">
                    <Topbar />
                    <div className="flex flex-col w-full space-y-8 p-4 justify-start items-start">
                        <div className="flex flex-col space-y-4 w-full">
                            <h1 className="text-gray-300 text-2xl">Your Groups</h1>
                            {groups.length === 0 ? (
                                <div className="max-w-md bg-white bg-opacity-5 rounded-lg p-6 text-center">
                                    <h3 className="text-lg font-medium text-gray-200 mb-2">No Groups</h3>
                                    <p className="text-gray-400 mb-4">You are not a member of any Groups!</p>
                                    <button
                                        onClick={() => setShowJoinGroupDialog(true)}
                                        className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Join a Group
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto select-none">
                                    <Carousel className="relative w-full">
                                        <CarouselContent className="flex whitespace-nowrap gap-4 -ml-2 pr-24">
                                            {groups.map((group) => (
                                                <CarouselItem key={group.id} className="pl-2 shrink-0 basis-auto">
                                                    <GroupCard group={group} />
                                                </CarouselItem>
                                            ))}
                                            <CarouselItem className="pl-2 shrink-0 basis-auto opacity-0 pointer-events-none">
                                                <div className="w-[200px] h-full" />
                                            </CarouselItem>
                                        </CarouselContent>
                                    </Carousel>
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <h1 className="text-gray-300 text-2xl">Latest Assignments</h1>
                            {assignments.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 w-fit">
                                    {assignments.slice(0, 6).map((assignment) => (
                                        <AssignmentCard
                                            key={assignment.id}
                                            title={assignment.title}
                                            dueDate={assignment.dueDate}
                                            maxScore={assignment.maxScore}
                                            onClick={() => handleSelectAssignment(assignment)}
                                            onClone={() => handleCloneAssignment(assignment)}
                                            assignment={assignment}
                                            groupId={assignment.group_id}
                                            onSave={handleSaveAssignment}
                                            userRole={userRole}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-300 col-span-full">You have no assignments currently.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <JoinGroupDialog
                isOpen={showJoinGroupDialog}
                onOpenChange={setShowJoinGroupDialog}
                onJoin={handleJoinGroup}
            />
        </>
    )
}

export default Dashboard