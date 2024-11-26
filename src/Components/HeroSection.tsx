import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {isTokenValid} from "@/Api/auth.tsx";
import {useNavigate} from "react-router-dom";

// Register FilePond plugins
registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const HeroSection = () => {
    const [files, setFiles] = useState<File[]>([]);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                </div>

                {/* File Upload */}
                <div className="mt-8 md:mt-0 md:w-1/2 md:flex md:justify-end">
                    <div className="rounded-lg p-6 bg-transparent border-dashed border-2 border-gray-500 inline-block shadow-lg w-full max-w-lg">
                        <FilePond
                            files={files}
                            onupdatefiles={(fileItems) => {
                                if (isTokenValid()) {
                                    setFiles(fileItems.map((item) => item.file as File));
                                } else {
                                    navigate('/login');
                                }
                            }}
                            allowMultiple={false}
                            maxFiles={1}
                            server={{
                                url: 'http://localhost:8080/api/files',
                                process: {
                                    url: '/upload',
                                    method: 'POST',
                                    headers: {
                                        'Authorization': 'Bearer ' + token
                                    },
                                    withCredentials: true,
                                    onload: (response) => response.key,
                                    onerror: (response) => response.data,
                                    ondata: (formData) => {
                                        const file = formData.get('file');
                                        if (file) {
                                            formData.append('file', file);
                                        }
                                        return formData;
                                    }
                                }
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