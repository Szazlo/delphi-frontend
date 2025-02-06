import './Dashboard.css'

import Sidebar from "@/Components/Sidebar.tsx";
import Topbar from "@/Components/Topbar.tsx";
// import {isTokenValid} from "@/Api/auth.tsx";
// import {FilePondFile} from "filepond";
import {useEffect, useState} from "react";
// import {useNavigate} from "react-router-dom";

// import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
// import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
// import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
// import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import GroupCard from "@/Components/GroupCard.tsx";

// Register FilePond plugins
// registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

interface Group {
    id: string;
    name: string;
    owner: string;
    description: string;
    coverImg: string;
}

function Dashboard() {
    // const [files, setFiles] = useState<File[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const token = localStorage.getItem('token');
    // const navigate = useNavigate();

    // const handleSubmission = (submissionId: string) => {
    //     navigate(`/results/${submissionId}`);
    // }

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
                console.log(data);
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        fetchGroups();
    }, [token]);

    return (
        <>
            <div className="flex w-screen">
                <Sidebar/>
                <div className="flex flex-col w-full">
                    <Topbar/>
                    <div className="flex flex-col w-full space-y-4 px-6 justify-start items-start">
                        <h1 className="text-gray-300 text-2xl text-center">Your groups</h1>
                        <div className="flex overflow-x-auto space-x-4">
                            {groups.map((group) => (
                                <GroupCard key={group.id} group={group}/>
                            ))}
                        </div>
                        {/*<h1 className="text-gray-300 mb-4 text-2xl text-center">Start a new analysis</h1>*/}
                        {/*<div*/}
                        {/*    className="rounded-lg p-6 bg-transparent border-dashed border-2 border-gray-500 inline-block shadow-lg w-60 max-w-lg">*/}
                        {/*    <FilePond*/}
                        {/*        files={files}*/}
                        {/*        onupdatefiles={(fileItems) => {*/}
                        {/*            if (isTokenValid()) {*/}
                        {/*                setFiles(fileItems.map((item) => item.file as File));*/}
                        {/*            } else {*/}
                        {/*                navigate('/login');*/}
                        {/*            }*/}
                        {/*        }}*/}
                        {/*        allowMultiple={false}*/}
                        {/*        maxFiles={1}*/}
                        {/*        credits={false}*/}
                        {/*        server={{*/}
                        {/*            url: 'http://localhost:8080/api/files',*/}
                        {/*            process: {*/}
                        {/*                url: '/upload',*/}
                        {/*                method: 'POST',*/}
                        {/*                headers: {*/}
                        {/*                    'Authorization': 'Bearer ' + token*/}
                        {/*                },*/}
                        {/*                withCredentials: true,*/}
                        {/*                onload: (response) => {*/}
                        {/*                    const {submissionId} = JSON.parse(response);*/}
                        {/*                    return submissionId;*/}
                        {/*                },*/}
                        {/*                onerror: (response) => response.data,*/}
                        {/*                ondata: (formData) => {*/}
                        {/*                    const file = formData.get('file');*/}
                        {/*                    if (file) {*/}
                        {/*                        formData.append('file', file);*/}
                        {/*                    }*/}
                        {/*                    return formData;*/}
                        {/*                }*/}
                        {/*            }*/}
                        {/*        }}*/}
                        {/*        onprocessfile={(error, file: FilePondFile) => {*/}
                        {/*            if (!error) {*/}
                        {/*                const submissionId = file.serverId;*/}
                        {/*                handleSubmission(submissionId);*/}
                        {/*            }*/}
                        {/*        }}*/}
                        {/*        name="file"*/}
                        {/*        className="bg-transparent border-dashed border-gray-500 text-gray-400"*/}
                        {/*        labelIdle='Drag & Drop your file or <span class="text-gray-500 underline">Browse</span>'*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
