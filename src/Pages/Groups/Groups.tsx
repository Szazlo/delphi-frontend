import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import GroupCard from "@/Components/GroupCard.tsx";

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
}

interface Assignment {
    id: string;
    group_id: string;
    name: string;
    description: string;
    time_limit: number;
    memory_limit: number;
    max_score: number;
}

function Groups() {
    const { id } = useParams<{ id: string }>();
    const [groups, setGroups] = useState<Group[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [group, setGroup] = useState<Group | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const userId = localStorage.getItem('userId');
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
                const response = await fetch(`http://localhost:8080/api/assignments/group/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch assignments');
                }
                const data = await response.json();
                setAssignments(data);

                const groupResponse = await fetch(`http://localhost:8080/api/groups/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!groupResponse.ok) {
                    throw new Error('Failed to fetch group details');
                }
                const groupData = await groupResponse.json();
                setGroup(groupData);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        if (id) {
            fetchAssignments();
        } else {
            fetchGroups();
        }
    }, [id, token]);

    return (
        <div className="flex w-screen">
            <Sidebar />
            <div className="flex flex-col w-full">
                <Topbar />
                <div className="p-4">
                    {id ? (
                        <>
                            <h1 className="font-bold text-gray-300 text-2xl">Group {group?.name}</h1>
                            <p className="text-gray-300">{group?.description}</p>
                            <hr className="my-2 border-gray-500" />
                            <h2 className="text-xl mt-4 text-gray-300 font-semibold">Assignments</h2>
                            <ul className="space-y-4">
                                {assignments.length > 0 ? (
                                    <ul className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <li key={assignment.id} className="p-4 border rounded-lg">
                                                <h2 className="text-xl font-bold">{assignment.name}</h2>
                                                <p>{assignment.description}</p>
                                                <p>Time Limit: {assignment.time_limit} hours</p>
                                                <p>Memory Limit: {assignment.memory_limit} MB</p>
                                                <p>Max Score: {assignment.max_score}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-300">There are no assignments for {group?.name} currently.</p>
                                )}
                            </ul>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl mb-4 text-gray-300">Your Groups</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {groups.map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Groups;