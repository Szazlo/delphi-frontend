import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import {toast} from "sonner";

interface JoinGroupDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onJoin: (groupId: string) => void;
}

const JoinGroupDialog = ({ isOpen, onOpenChange, onJoin }: JoinGroupDialogProps) => {
    const [groupId, setGroupId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
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
            toast.success('Joined group successfully');
            onJoin(groupId);
            onOpenChange(false);
            setGroupId('');
            setError('');
            window.location.reload();
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-gray-300">Join Group</DialogTitle>
                </DialogHeader>
                <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                    <input
                        type="text"
                        placeholder="Group ID"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        className="mb-2 p-2 border rounded w-full bg-transparent border-gray-600"
                    />
                    {error && <p className="text-error mb-2">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                    >
                        Join
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default JoinGroupDialog;