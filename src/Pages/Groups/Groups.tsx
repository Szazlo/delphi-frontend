import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import GroupCard from "@/Components/GroupCard.tsx";
import AssignmentCard from "@/Components/AssignmentCard.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import UserGroupMgmtTable from "@/Components/UserGroupMgmtTable.tsx";
import AssignmentDialog from "@/Components/AssignmentDialog.tsx";
import JoinGroupDialog from "@/Components/JoinGroupDialog.tsx";
import { toast } from "sonner"

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
    archived: boolean;
}

interface Assignment {
    dueDate: string | null;
    id: string;
    group: Group;
    title: string;
    description: string;
    timeLimit: number;
    memoryLimit: number;
    maxScore: number;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    inGroup: boolean;
}

function Groups() {
    const { id } = useParams<{ id: string }>();
    const [groups, setGroups] = useState<Group[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [group, setGroup] = useState<Group | null>(null);
    const [showArchivedGroups, setShowArchivedGroups] = useState(false);
    const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
    const [showManageGroupDialog, setShowManageGroupDialog] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", coverImg: "" });
    const [editGroup, setEditGroup] = useState<Group | null>(null);
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const activeGroups = groups.filter(group => !group.archived);
    const archivedGroups = groups.filter(group => group.archived);

    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showJoinGroupDialog, setShowJoinGroupDialog] = useState(false);

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

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/auth/getUsers', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const usersInGroup = await Promise.all(data.map(async (user: any) => {
                    const usersInGroupResponse = await fetch(`http://localhost:8080/api/groups/${id}/users`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (!usersInGroupResponse.ok) {
                        throw new Error('Failed to fetch users in group');
                    }
                    const usersInGroupData = await usersInGroupResponse.json();
                    const inGroup = usersInGroupData.some((u: any) => u.userId === user.id);
                    return { ...user, inGroup };
                }));
                setUsers(usersInGroup);
            } catch (error) {
                setError((error as Error).message);
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
            fetchUsers();
        } else {
            fetchGroups();
        }
    }, [id, token]);

    const handleCreateGroup = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch('http://localhost:8080/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newGroup, owner: userId })
            });
            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            const createdGroup = await response.json();
            setGroups([...groups, createdGroup]);
            setShowCreateGroupDialog(false);
            setNewGroup({ name: "", description: "", coverImg: "" });
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleUpdateGroup = async () => {
        if (!editGroup) return;

        try {
            const response = await fetch(`http://localhost:8080/api/groups/${editGroup.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editGroup)
            });
            if (!response.ok) {
                toast.error("Failed to update group!")
                throw new Error('Failed to update group');
            }
            const updatedGroup = await response.json();
            setGroups(groups.map(group => group.id === updatedGroup.id ? updatedGroup : group));
            setShowManageGroupDialog(false);
            setEditGroup(null);
            toast.success("Group updated!");
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleDeleteGroup = async () => {
        if (!editGroup) return;

        if (!confirm('This will delete the group AND all associated assignments and submissions!\n' +
            'Are you sure you want to delete this group? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/groups/${editGroup.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                toast.error("Failed to delete group");
                throw new Error('Failed to delete group');
            }

            setShowManageGroupDialog(false);
            setEditGroup(null);
            navigate('/groups');
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleArchiveGroup = async (group: Group) => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:8080/api/groups/${group.id}/archive?owner=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                toast.error("Failed to archive group");
                throw new Error('Failed to archive group');
            }

            setGroups(prevGroups =>
                prevGroups.map(g => g.id === group.id ? {...g, archived: true} : g)
            );
            toast.success("Group archived!");
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleRestoreGroup = async (group: Group) => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:8080/api/groups/${group.id}/restore?owner=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                toast.error("Failed to restore group");
                throw new Error('Failed to restore group');
            }
            toast.success("Group restored!")
            setGroups(prevGroups =>
                prevGroups.map(g => g.id === group.id ? {...g, archived: false} : g)
            );
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    const handleSelectAssignment = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowAssignmentDialog(true);
        navigate(`/assignments/${assignment.id}`);
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

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = async (groupId: any) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch(`http://localhost:8080/api/groups/${groupId}/users?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 404) {
                setError('Group not found');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to join group');
            }
            setError('');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <div className="flex w-screen h-screen overflow-y-auto">
            <Sidebar />
            <div className="flex flex-col w-full">
                <Topbar />
                <div className="p-4">
                    {id ? (
                        <>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <h1 className="font-bold text-gray-300 text-2xl">Group {group?.name}</h1>
                                    <p className="text-gray-300">{group?.description}</p>
                                </div>
                                {(roles.includes('admin') || group?.owner === localStorage.getItem('userId')) && (
                                    <div className="flex justify-end">
                                        <Dialog open={showManageGroupDialog} onOpenChange={setShowManageGroupDialog}>
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={() => {
                                                        setEditGroup(group);
                                                        setShowManageGroupDialog(true);
                                                    }}
                                                    className="bg-white bg-opacity-10 hover:bg-background-contrast border-0 text-white font-bold py-2 px-4 rounded"
                                                >
                                                    Manage Group
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="text-gray-300">Manage Group</DialogTitle>
                                                    <DialogDescription>Update the details below to manage the
                                                        group</DialogDescription>
                                                </DialogHeader>
                                                <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                                                    <input
                                                        type="text"
                                                        placeholder="Group Name"
                                                        value={editGroup?.name || ""}
                                                        onChange={(e) => setEditGroup({
                                                            ...editGroup!,
                                                            name: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Description"
                                                        value={editGroup?.description || ""}
                                                        onChange={(e) => setEditGroup({
                                                            ...editGroup!,
                                                            description: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Cover Image URL"
                                                        value={editGroup?.coverImg || ""}
                                                        onChange={(e) => setEditGroup({
                                                            ...editGroup!,
                                                            coverImg: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleDeleteGroup}
                                                            className="bg-error hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                                                        >
                                                            Delete Group
                                                        </button>
                                                        <button
                                                            onClick={handleUpdateGroup}
                                                            className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                                                        >
                                                            Update
                                                        </button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>
                            <hr className="my-2 border-gray-500"/>
                            <div className="flex justify-between items-center my-4">
                                <h2 className="text-xl text-gray-300 font-semibold">Assignments</h2>
                                {(roles.includes('admin') || group?.owner === localStorage.getItem('userId')) && (
                                    <button
                                        onClick={() => setShowAssignmentDialog(true)}
                                        className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded"
                                    >
                                        + New Assignment
                                    </button>
                                )}
                                <AssignmentDialog
                                    groupId={id}
                                    onSave={(assignment: Assignment, groupId: string) => {
                                        if (groupId === id) {
                                            setAssignments([...assignments, assignment]);
                                        }
                                    }}
                                    isOpen={showAssignmentDialog}
                                    onOpenChange={setShowAssignmentDialog}
                                />
                            </div>
                            <ul className="space-y-4 max-h-[40vh] overflow-y-auto pb-4 pr-2">
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
                                    <p className="text-gray-300">There are no assignments
                                        for {group?.name} currently.</p>
                                )}
                            </ul>
                            {(roles.includes('admin') || group?.owner === localStorage.getItem('userId')) && (
                                <>
                                    <h2 className="text-xl mt-4 text-gray-300 font-semibold">Users in Group</h2>
                                    <input
                                        type="text"
                                        placeholder="Search users"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="mb-4 p-2 rounded border border-gray-300 text-black"
                                    />
                                    <div className="flex flex-col w-full h-72 overflow-y-auto border border-gray-700 rounded">
                                        <UserGroupMgmtTable initialUsers={filteredUsers} groupId={id}/>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl mb-4 text-gray-300">Your Groups</h1>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowJoinGroupDialog(true)}
                                        className="mb-4 bg-white bg-opacity-10 hover:bg-background-contrast border-0 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Join Group
                                    </button>
                                    {roles.includes('admin') || roles.includes('manager') ? (
                                        <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={() => setShowCreateGroupDialog(true)}
                                                    className="mb-4 bg-white bg-opacity-10 hover:bg-background-contrast border-0 text-white font-bold py-2 px-4 rounded"
                                                >
                                                    + New Group
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="text-gray-300">Create Group</DialogTitle>
                                                    <DialogDescription>Fill in the details below to create a new
                                                        group</DialogDescription>
                                                </DialogHeader>
                                                <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                                                    <input
                                                        type="text"
                                                        placeholder="Group Name"
                                                        value={newGroup.name}
                                                        onChange={(e) => setNewGroup({
                                                            ...newGroup,
                                                            name: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Description"
                                                        value={newGroup.description}
                                                        onChange={(e) => setNewGroup({
                                                            ...newGroup,
                                                            description: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Cover Image URL"
                                                        value={newGroup.coverImg}
                                                        onChange={(e) => setNewGroup({
                                                            ...newGroup,
                                                            coverImg: e.target.value
                                                        })}
                                                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleCreateGroup}
                                                            className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                                                        >
                                                            Create
                                                        </button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ) : null}
                                </div>
                            </div>
                            {/* Active Groups Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {activeGroups.length > 0 ? (
                                    activeGroups.map((group) => (
                                        <GroupCard
                                            key={group.id}
                                            group={group}
                                            onArchive={handleArchiveGroup}
                                        />
                                    ))
                                ) : (
                                    <p className="col-span-full text-gray-400">No active groups found.</p>
                                )}
                            </div>

                            {/* Archived Groups Section */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowArchivedGroups(!showArchivedGroups)}
                                    className="flex items-center text-gray-300 mb-4"
                                >
                                    <span className="mr-2">{showArchivedGroups ? '▼' : '►'}</span>
                                    <h2>Archived Groups ({archivedGroups.length})</h2>
                                </button>

                                {showArchivedGroups && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {archivedGroups.length > 0 ? (
                                            archivedGroups.map((group) => (
                                                <GroupCard
                                                    key={group.id}
                                                    group={group}
                                                    onRestore={handleRestoreGroup}
                                                    isArchived={true}
                                                />
                                            ))
                                        ) : (
                                            <p className="col-span-full text-gray-400">No archived groups found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <JoinGroupDialog
                isOpen={showJoinGroupDialog}
                onOpenChange={setShowJoinGroupDialog}
                onJoin={handleJoinGroup}
            />
        </div>
    );
}

export default Groups;