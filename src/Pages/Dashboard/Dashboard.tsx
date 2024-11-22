import './Dashboard.css'

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";

function Dashboard() {
    return (
        <>
            <div className="flex w-screen">
                <Sidebar/>
                <div className="flex w-full">
                    <Topbar/>
                </div>
            </div>
        </>
    )
}

export default Dashboard
