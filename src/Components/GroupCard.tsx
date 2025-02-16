import { useNavigate } from "react-router-dom";

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
}

interface GroupCardProps {
    group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/groups/${group.id}`);
    };

    return (
        <div onClick={handleClick}
             className="group-card relative rounded-lg bg-white w-64 h-full flex-shrink-0 cursor-pointer">
            {group.owner === localStorage.getItem('userId') && (
                <div
                    className="absolute top-2 right-2 bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 text-white text-xs px-2 py-1 rounded-full">
                    Owner
                </div>
            )}
            <img src={group.coverImg} alt={group.name} className="w-full h-32 object-cover rounded-t-lg"/>
            <div className="p-4">
                <h2 className="text-xl font-bold">{group.name}</h2>
                <p className="text-gray-600 text-wrap">{group.description}</p>
            </div>
        </div>
    );
};

export default GroupCard;