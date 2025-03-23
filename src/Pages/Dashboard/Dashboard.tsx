import './Dashboard.css'

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import {useEffect, useState} from "react";
import GroupCard from "@/Components/GroupCard.tsx";
import AssignmentCard from "@/Components/AssignmentCard.tsx";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/Components/ui/carousel";

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
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

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

    return (
        <>
            <div className="flex w-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col w-full">
                    <Topbar />
                    <div className="flex flex-col w-full space-y-8 p-4 justify-start items-start">
                        <div className="flex flex-col space-y-4 w-full">
                            <h1 className="text-gray-300 text-2xl">Your Groups</h1>
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
                        </div>

                        <div className="flex flex-col space-y-4 w-full">
                            <h1 className="text-gray-300 text-2xl">Your Assignments</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                {assignments.length > 0 ? (
                                    assignments.map((assignment) => (
                                        <AssignmentCard
                                            key={assignment.id}
                                            title={assignment.title}
                                            dueDate={assignment.dueDate}
                                            maxScore={assignment.maxScore}
                                            onClick={() => handleSelectAssignment(assignment)}
                                            onClone={() => {}}
                                            assignment={assignment}
                                            groupId={assignment.group_id}
                                            onSave={() => {}}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-300 col-span-full">You have no assignments currently.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
