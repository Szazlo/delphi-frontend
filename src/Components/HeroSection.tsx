import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { isTokenValid } from "@/Api/auth.tsx";
import { useNavigate } from "react-router-dom";
import { FilePondFile } from "filepond";
import API_URL from "@/Api/APIConfig.tsx";

// Register FilePond plugins
registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const HeroSection = () => {
    const [files, setFiles] = useState<File[]>([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSubmission = (submissionId: string) => navigate(`/results/${submissionId}`);

    const handleFileUpdate = (fileItems: FilePondFile[]) => {
        if (isTokenValid()) {
            setFiles(fileItems.map(item => item.file as File));
        } else {
            navigate('/login');
        }
    };

    return (
        <section className="p-6 text-white my-14">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Text Content */}
                <div className="text-center md:text-left md:w-1/2">
                    <h1 className="text-5xl font-bold">
                        Instant feedback
                        <br />
                        <span className="bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent">
                            on your code.
                        </span>
                    </h1>
                    <p className="mt-4 text-lg">
                        Get detailed, AI-driven feedback on your code in seconds. Learn faster, write cleaner code, and level up your programming skills with personalized suggestions and expert guidance.
                    </p>
                </div>

                {/* File Upload */}
                <div className="mt-8 md:mt-0 md:w-1/2 md:flex md:justify-end">
                    <div className="rounded-lg p-6 bg-transparent border-dashed border-2 border-gray-500 shadow-lg w-full max-w-lg">
                        <FilePond
                            files={files}
                            onupdatefiles={handleFileUpdate}
                            allowMultiple={false}
                            maxFiles={1}
                            credits={false}
                            server={{
                                url: `${API_URL}/files`,
                                process: {
                                    url: '/upload',
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${token}` },
                                    withCredentials: true,
                                    onload: (response) => JSON.parse(response).submissionId,
                                    onerror: (response) => response.data,
                                    ondata: (formData) => {
                                        const file = formData.get('file');
                                        if (file) formData.append('file', file);
                                        return formData;
                                    },
                                },
                            }}
                            onprocessfile={(error, file) => {
                                if (!error) handleSubmission(file.serverId);
                            }}
                            name="file"
                            className="bg-transparent border-dashed border-gray-500 text-gray-400"
                            labelIdle='Drag & Drop your file or <span class="text-gray-500 underline">Browse</span>'
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
