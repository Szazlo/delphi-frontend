import { useNavigate } from "react-router-dom";
import { Group } from '../types';
import { toast } from "sonner"

interface GroupCardProps {
    group: Group;
    onArchive?: (group: Group) => void;
    onRestore?: (group: Group) => void;
    isArchived?: boolean;
}

const GroupCard = ({ group, onArchive, onRestore, isArchived = false }: GroupCardProps) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const isOwner = userId === group.owner;

    const handleCardClick = () => {
        if (isArchived) {
            toast.error('This group is archived and cannot be accessed');
            return;
        }

        navigate(`/groups/${group.id}`);
    };

    return (
        <div
            className={`bg-white bg-opacity-5 rounded shadow-md ${
                isArchived ? 'grayscale' : 'hover:bg-opacity-10 cursor-pointer'
            } transition-all relative`}
            onClick={handleCardClick}
        >
            {isOwner && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 px-1 rounded-md z-10">
                    <span className="text-xs text-white">Owner</span>
                </div>
            )}
            <div className="h-32 mb-2 overflow-hidden rounded">
                <img
                    src={group.coverImg || 'https://placehold.co/300x150?text=Group'}
                    alt={group.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-300">{group.name}</h3>
                <p className="text-sm text-gray-400">{group.description}</p>

                <div className="mt-2 flex justify-between items-center">
                    {!isArchived && onArchive && isOwner && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive(group);
                            }}
                            className="text-xs text-gray-400 hover:text-error"
                        >
                            Archive
                        </button>
                    )}

                    {isArchived && onRestore && isOwner && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestore(group);
                            }}
                            className="text-xs text-gray-400 hover:text-success"
                        >
                            Restore
                        </button>
                    )}

                    {isArchived && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                            Archived
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupCard;