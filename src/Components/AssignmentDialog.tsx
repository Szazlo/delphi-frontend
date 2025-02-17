import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible"

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

interface Group {
    id: string;
    name: string;
    owner: string;
}

interface AssignmentDialogProps {
    groupId?: string;
    assignment?: Assignment;
    onSave: (assignment: Assignment, group_id: string) => void;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({ groupId, assignment, onSave }) => {
    const [formData, setFormData] = useState<Assignment>({
        dueDate: assignment?.dueDate || null,
        id: assignment?.id || '',
        group_id: groupId || assignment?.group_id || '',
        title: assignment?.title || '',
        description: assignment?.description || '',
        timeLimit: assignment?.timeLimit || 10,
        memoryLimit: assignment?.memoryLimit || 500,
        maxScore: assignment?.maxScore || 0,
    });
    const [series, setSeries] = useState<number | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/groups`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            const data = await response.json();
            const userGroups = data.filter((group: Group) => group.owner === userId);
            setGroups(userGroups);
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        if (assignment) {
            setFormData({
                dueDate: assignment.dueDate,
                id: assignment.id,
                group_id: assignment.group_id,
                title: assignment.title,
                description: assignment.description,
                timeLimit: assignment.timeLimit,
                memoryLimit: assignment.memoryLimit,
                maxScore: assignment.maxScore,
            });
        }
    }, [assignment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: name === 'timeLimit' || name === 'memoryLimit' || name === 'maxScore' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        const formattedDueDate = formData.dueDate ? new Date(formData.dueDate).toISOString().replace('T', ' ').replace('Z', '') : null;
        const formattedData = {
            title: formData.title,
            description: formData.description,
            time_limit: formData.timeLimit,
            memory_limit: formData.memoryLimit,
            due_date: formattedDueDate,
            max_score: formData.maxScore,
            group_id: formData.group_id,
        };

        const createAssignment = async (data: any) => {
            const url = assignment ? `http://localhost:8080/api/assignments/${assignment.id}` : 'http://localhost:8080/api/assignments';
            const method = assignment ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to save assignment');
            }
            return await response.json();
        };

        try {
            if (series && series > 1) {
                for (let i = 1; i <= series; i++) {
                    const dataWithSeries = {
                        ...formattedData,
                        title: `${formData.title} - ${i}`,
                    };
                    const data = await createAssignment(dataWithSeries);
                    onSave(data, formData.group_id);
                }
            } else {
                const data = await createAssignment(formattedData);
                onSave(data, formData.group_id);
            }
            setIsOpen(false);
        } catch (error) {
            setError((error as Error).message);
        }
    };

    const handleDelete = async () => {
        if (!assignment) return;
        const confirmed = window.confirm('Are you sure you want to delete this assignment?\nThis action cannot be undone.');
        if (!confirmed) return;
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/assignments/${assignment.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete assignment');
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="bg-white bg-opacity-10 hover:bg-background-contrast border-0 text-white font-bold py-2 px-4 rounded" onClick={() => setIsOpen(true)}>
                    {assignment ? 'Edit Assignment' : 'Create an Assignment'}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle
                        className="text-gray-300">{assignment ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
                    <DialogDescription>Fill in the details below to {assignment ? 'edit' : 'create'} an
                        assignment</DialogDescription>
                </DialogHeader>
                <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                    {!assignment && (
                        <select
                            name="group_id"
                            value={formData.group_id}
                            onChange={handleChange}
                            className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                        >
                            <option value="">Select Group</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <input
                        type="date"
                        name="dueDate"
                        placeholder="Due Date"
                        value={formData.dueDate || ''}
                        required={true}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <input
                        type="number"
                        name="timeLimit"
                        placeholder="Time Limit (ms)"
                        value={formData.timeLimit}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <input
                        type="number"
                        name="memoryLimit"
                        placeholder="Memory Limit (KB)"
                        value={formData.memoryLimit}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <input
                        type="number"
                        name="maxScore"
                        placeholder="Max Score"
                        value={formData.maxScore}
                        onChange={handleChange}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    <div className="flex justify-end space-x-2">
                        {assignment && (
                            <button
                                onClick={handleDelete}
                                className="bg-error hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                        >
                            {assignment ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
                <Collapsible>
                    <CollapsibleTrigger className="bg-transparent border-1 border-gray-600 text-white font-bold py-2 px-4 rounded w-full text-center">
                        Create a Series
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                            <p className="text-gray-300 w-full p-2 text-sm font-semibold">
                                Providing a number here will create the number duplicates with the same properties.<br/>The title for each will be the provided title with "- n" appended to it i.e. Assignment - 1.
                            </p>
                            <input type="number"
                                   placeholder="Number of assignments"
                                   className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                                   onChange={(e) => setSeries(e.target.value ? parseInt(e.target.value) : null)}
                                   min={2}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </DialogContent>
        </Dialog>
    );
};

export default AssignmentDialog;