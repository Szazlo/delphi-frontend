import React, { useState } from 'react';
import AssignmentDialog from './AssignmentDialog';
import { Assignment } from '../types';

interface AssignmentCardProps {
    key: string;
    title: string;
    dueDate: string | null;
    maxScore: number;
    onClick: () => void;
    onClone: () => void;
    assignment: Assignment;
    groupId: string;
    onSave: (assignment: Assignment, groupId: string) => void;
}

const AssignmentCard = ({ title, dueDate, maxScore, onClick, onClone, assignment, groupId, onSave }: AssignmentCardProps) => {
    const [showDialog, setShowDialog] = useState(false);

    const handleManageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDialog(true);
    };

    const handleDialogClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <>
            <div onClick={onClick} className="bg-white bg-opacity-10 p-4 rounded-lg shadow-md hover:bg-opacity-20 transition duration-300 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-300">{title}</h2>
                    {dueDate ? (
                        <p className="text-gray-400">Due Date: {new Date(dueDate).toLocaleDateString()}</p>
                    ) : (
                        <p className="text-gray-400">Due Date: Not specified</p>
                    )}
                    <p className="text-gray-400">Max Score: {maxScore}</p>
                </div>
                <div className="flex items-end space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClone();
                        }}
                        className="text-white font-bold py-1 px-2 rounded mt-2 bg-white bg-opacity-10 hover:bg-opacity-20 transition duration-300"
                    >
                        Clone
                    </button>
                    <button
                        onClick={handleManageClick}
                        className="text-white font-bold py-1 px-2 rounded mt-2 bg-white bg-opacity-10 hover:bg-opacity-20 transition duration-300"
                    >
                        Manage
                    </button>
                </div>
            </div>
            {showDialog && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={handleDialogClick}
                >
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDialog(false);
                        }}
                    />
                    <div
                        className="relative z-50 max-w-lg mx-auto"
                        onClick={handleDialogClick}
                    >
                        <AssignmentDialog
                            groupId={groupId}
                            assignment={assignment}
                            onSave={(updatedAssignment: Assignment) => {
                                onSave(updatedAssignment, groupId);
                                setShowDialog(false);
                            }}
                            isOpen={showDialog}
                            onOpenChange={setShowDialog}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignmentCard;