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
        <div onClick={handleClick} className="group-card rounded-lg bg-white w-64 flex-shrink-0 cursor-pointer">
            <img src={group.coverImg} alt={group.name} className="w-full h-32 object-cover rounded-t-lg"/>
            <div className="p-4">
                <h2 className="text-xl font-bold">{group.name}</h2>
                <p className="text-gray-600">{group.description}</p>
            </div>
        </div>
    );
};

export default GroupCard;