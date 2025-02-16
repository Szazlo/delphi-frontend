// import React from 'react';

interface AssignmentCardProps {
    key: string;
    title: string;
    dueDate: string | null;
    maxScore: number;
    onClick: () => void;
    onClone: () => void;
}

const AssignmentCard = ({ title, dueDate, maxScore, onClick, onClone }: AssignmentCardProps) => {
    return (
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
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClone();
                }}
                className="text-white font-bold py-1 px-2 rounded mt-2 bg-white bg-opacity-10 hover:bg-opacity-20 transition duration-300"
            >
                Clone
            </button>
        </div>
    );
};

export default AssignmentCard;