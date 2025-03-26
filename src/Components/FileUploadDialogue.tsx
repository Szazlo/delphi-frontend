import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { useNavigate } from "react-router-dom";
import API_URL from "@/Api/APIConfig.tsx";

registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

interface FileUploadDialogProps {
    token: string | null;
    assignmentId: string;
    onSubmission: (submissionId: string) => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ token, assignmentId, onSubmission }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSuccess = (submissionId: string) => {
        setErrorMessage(null);
        setSubmissionId(submissionId);
        onSubmission(submissionId);
        // setIsDialogOpen(false);
    };

    const handleGoToSubmission = () => {
        if (submissionId) {
            navigate(`/results/${submissionId}`);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="bg-error bg-opacity-80 rounded-lg shadow-md hover:bg-opacity-60 transition duration-300 cursor-pointer text-white">
                Submit assignment
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-gray-300">Upload File</DialogTitle>
                    <DialogDescription>Drag & Drop your file or browse to upload</DialogDescription>
                </DialogHeader>
                <div className="p-4">
                    {errorMessage && (
                        <p className="text-red-500 bg-red-100 p-2 rounded">{errorMessage}</p>
                    )}
                    <FilePond
                        files={files}
                        onupdatefiles={(fileItems) => {
                            setFiles(fileItems.map((item) => item.file as File));
                        }}
                        allowMultiple={false}
                        maxFiles={1}
                        credits={false}
                        server={{
                            url: `${API_URL}/files`,
                            process: {
                                url: '/upload',
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                                withCredentials: true,
                                onload: (response) => {
                                    try {
                                        const parsedResponse = JSON.parse(response);
                                        if (parsedResponse.submissionId) {
                                            handleSuccess(parsedResponse.submissionId);
                                        } else {
                                            setErrorMessage("Upload failed. No submission ID received.");
                                        }
                                    } catch (error) {
                                        setErrorMessage("Invalid response from server.");
                                    }
                                },
                                onerror: (response) => {
                                    console.error("File upload error:", response);
                                    setErrorMessage("File upload failed. Please try again.");
                                },
                                ondata: (formData) => {
                                    formData.append("assignmentId", assignmentId);
                                    return formData;
                                },
                            }
                        }}
                        name="file"
                        className="bg-transparent border-dashed border-gray-500 text-gray-400"
                        labelIdle='Drag & Drop your file or <span class="text-gray-500 underline">Browse</span>'
                    />
                    {submissionId && (
                        <button
                            onClick={handleGoToSubmission}
                            className="mt-4 bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded border-0"
                        >
                            Go to Submission
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FileUploadDialog;