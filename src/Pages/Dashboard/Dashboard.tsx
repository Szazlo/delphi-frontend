import './Dashboard.css'

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
import {useEffect, useState} from "react";

import GroupCard from "@/Components/GroupCard.tsx";

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
}

function Dashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
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

        fetchGroups();
    }, [token]);


    return (
        <>
            <div className="flex w-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col w-full">
                    <Topbar />
                    <div className="flex flex-col w-full space-y-4 p-4 justify-start items-start">
                        <h1 className="text-gray-300 text-2xl text-center">Your Groups</h1>
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
                </div>
            </div>
        </>
    )
}

export default Dashboard
