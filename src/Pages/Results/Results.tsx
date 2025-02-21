import './Results.css'
import {useNavigate, useParams} from 'react-router-dom'
import {useEffect, useRef, useState} from 'react'
import {FaFileAlt, FaFolder} from "react-icons/fa";
import {Editor} from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import JSZip from 'jszip'
import {createReviewManager, ReviewCommentState, type ReviewManager} from "@/Components/monacoReview";
import { type ReviewCommentEvent } from "@/Components/monacoReview/events-comments-reducers.ts";

import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,} from "@/Components/ui/table"
import {Textarea} from "@/Components/ui/textarea"
import {ReviewerCombobox} from "@/Components/ReviewerCombobox.tsx";
import Topbar from "@/Components/Topbar.tsx";
import Sidebar from "@/Components/Sidebar.tsx";
import {render} from "react-dom";

interface Result {
    id: string;
    fileName: string;
    status: string;
    output: string;
    lintOutput: string;
    language: string;
    runtime: string;
    memory: string;
    timestamp: string;
    assignment: {
        title: string;
    };
}

interface Manager {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

let reviewManager: ReviewManager;

function Results() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [results, setResults] = useState<Result[]>([])
    const [specificResult, setSpecificResult] = useState<Result | null>(null)
    const [fileTree, setFileTree] = useState<any>(null)
    const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null)
    const [zipInstance, setZipInstance] = useState<JSZip | null>(null)
    const [managers, setManagers] = useState<Manager[]>([])
    const [selectedReviewer, setSelectedReviewer] = useState<Manager | null>(null);
    const outputRef = useRef<HTMLTextAreaElement>(null)
    const lintOutputRef = useRef<HTMLTextAreaElement>(null)
    const [reviewerAssigned, setReviewerAssigned] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const commentsRef = useRef<Record<string, any>>({});
    const [comments, setComments] = useState<ReviewCommentState[]>([]);

    const fetchResults = async () => {
        try {
            const userId = localStorage.getItem('userId')
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error('Error fetching results:', error)
        }
    }

    const fetchSpecificResult = async (submissionId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (!response.ok) {
                console.error('Error fetching specific result:', data)
                return
            }
            setSpecificResult(data)

            // Fetch the zip file as binary data
            const zipResponse = await fetch(`http://localhost:8080/api/submissions/download/${submissionId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const zipBlob = await zipResponse.blob()
            const zipArrayBuffer = await zipBlob.arrayBuffer()
            const zip = await JSZip.loadAsync(zipArrayBuffer)

            // Store the JSZip instance for later
            setZipInstance(zip)

            // Build the file tree from the zip files
            const tree = buildFileTree(zip.files)
            setFileTree(tree)
        } catch (error) {
            console.error('Error fetching specific result:', error)
        }
    }

    const fetchManagers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/auth/managers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            setManagers(data)
        } catch (error) {
            console.error('Error fetching managers:', error)
        }
    }

    const fetchReviewerStatus = async (submissionId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/reviewer/${submissionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.length > 0) {
                setReviewerAssigned(true)
                const reviewer = managers.find(manager => manager.id === data.reviewerId)
                if (reviewer) {
                    setSelectedReviewer(reviewer)
                }
            }
        } catch (error) {
            console.error('Error fetching reviewer status:', error)
        }
    }

    const assignReviewer = async (submissionId: string, reviewerId: string) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}/addreviewer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${token}`
                },
                body: `reviewerId=${reviewerId}`
            })
            if (response.status === 200) {
                setReviewerAssigned(true)
            } else {
                console.error('Error assigning reviewer:', response)
            }
        } catch (error) {
            console.error('Error assigning reviewer:', error)
        }
    }

    const buildFileTree = (files: any) => {
        const tree: any = {}
        Object.keys(files).forEach((filePath) => {
            const parts = filePath.split('/')
            let current = tree
            parts.forEach((part: string, index: number) => {
                if (!current[part]) {
                    current[part] = index === parts.length - 1 ? filePath : {}
                }
                current = current[part]
            })
        })
        return tree
    }

    const handleFileClick = async (filePath: string) => {
        if (zipInstance) {
            const file = zipInstance.file(filePath);
            if (file) {
                const fileContent = await file.async('text');
                setSelectedFileContent(fileContent);
                setSelectedFile(filePath);
            } else {
                console.error('File not found in ZIP:', filePath);
            }
        }
    };

    const renderFileTree = (tree: any, path: string = "") => {
        return Object.keys(tree).map((key) => {
            const fullPath = path ? `${path}/${key}` : key;
            if (typeof tree[key] === "string") {
                return (
                    <div
                        key={fullPath}
                        className="flex items-center space-x-2 pl-2 cursor-pointer hover:text-blue-500"
                        onClick={() => handleFileClick(fullPath)}
                    >
                        <FaFileAlt className="text-gray-500"/>
                        <span>{key}</span>
                    </div>
                );
            } else {
                return (
                    <div key={fullPath} className="pl-2">
                        <div className="flex items-center space-x-2">
                            <FaFolder className="text-yellow-500"/>
                            <span className="font-semibold">{key}</span>
                        </div>
                        <div className="ml-4 border-l-2 border-gray-300 pl-2">
                            {renderFileTree(tree[key], fullPath)}
                        </div>
                    </div>
                );
            }
        });
    };

    const getLanguageFromFileName = (fileName: string): string => {
        const extension = fileName.split('.').pop();
        switch (extension) {
            case 'js':
                return 'javascript';
            case 'ts':
                return 'typescript';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            default:
                return 'plaintext'; // Default to plain text
        }
    };

    const renderComments = () => {
        setComments(reviewManager ? Object.values(reviewManager.store.comments) : []);
    };

    useEffect(() => {
        if (currentEditor && selectedFile) {
            if (!commentsRef.current[selectedFile]) {
                commentsRef.current[selectedFile] = [];
            }
            reviewManager = createReviewManager(
                currentEditor,
                localStorage.getItem("name") || "Unknown",
                commentsRef.current[selectedFile],
                (updatedComments) => {
                    commentsRef.current[selectedFile] = updatedComments;
                    renderComments();
                    console.log("Updated Comments", updatedComments);
                },
                { filePath: selectedFile } // Pass the correct configuration object
            );
        }
    }, [currentEditor, selectedFile]);

    useEffect(() => {
        if (id) {
            fetchSpecificResult(id)
        } else {
            fetchResults()
        }
        fetchManagers()
    }, [id])

    useEffect(() => {
        if (id) {
            fetchReviewerStatus(id)
        }
    }, [id])

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.style.height = 'auto'
            outputRef.current.style.height = `${outputRef.current.scrollHeight}px`
        }
        if (lintOutputRef.current) {
            lintOutputRef.current.style.height = 'auto'
            lintOutputRef.current.style.height = `${lintOutputRef.current.scrollHeight}px`
        }
    }, [specificResult])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'text-green-500'
            case 'Pending':
                return 'text-gray-500'
            case 'Running':
                return 'text-amber-500'
            case 'Failed':
                return 'text-error'
            default:
                return ''
        }
    }

    function convertTimestampToDateTime(timestamp: number): string {
        const date = new Date(timestamp)
        return date.toLocaleString()
    }

    return (
        <>
            <div className="flex w-screen h-screen">
                <Sidebar/>
                <div className="flex flex-col w-full h-screen">
                    <Topbar/>
                    <div className="flex flex-col ml-4 text-white h-full overflow-auto pb-20">
                        {id && specificResult ? (
                            <div className="flex flex-col mr-4 space-y-4">
                                <div>
                                    <h2 className="text-lg">Results for {specificResult.fileName}</h2>
                                    <div className="flex justify-start mb-4">
                                        <p className={`text-sm ${getStatusColor(specificResult.status)}`}>{specificResult.status}</p>
                                        <p className="text-sm ml-4">{convertTimestampToDateTime(parseInt(specificResult.timestamp))}</p>
                                        <p className="text-sm ml-4">{specificResult.language}</p>
                                        <p className="text-sm ml-4">Runtime: {specificResult.runtime} ms</p>
                                        <p className="text-sm ml-4">Memory: {specificResult.memory} KB</p>
                                        <p className="text-sm ml-4">Assignment: {specificResult.assignment.title}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg">Execution Output</h3>
                                    <Textarea
                                        ref={outputRef}
                                        className="resize-none overflow-hidden border-0 bg-white bg-opacity-5 rounded-md shadow-md"
                                        value={specificResult.output}
                                        readOnly
                                        onChange={() => {
                                            if (outputRef.current) {
                                                outputRef.current.style.height = 'auto'
                                                outputRef.current.style.height = `${outputRef.current.scrollHeight}px`
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg">Linting</h3>
                                    <Textarea
                                        ref={lintOutputRef}
                                        className="resize-none overflow-hidden border-0 bg-white bg-opacity-5 rounded-md shadow-md"
                                        value={specificResult.lintOutput}
                                        readOnly
                                        onChange={() => {
                                            if (lintOutputRef.current) {
                                                lintOutputRef.current.style.height = 'auto'
                                                lintOutputRef.current.style.height = `${lintOutputRef.current.scrollHeight}px`
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg">Your project</h3>
                                    <div className="flex bg-white bg-opacity-5 rounded-md shadow-md">
                                        <div className="flex flex-col w-1/4 p-4 bg-white bg-opacity-5">
                                            <div className="overflow-auto h-96">{fileTree && renderFileTree(fileTree)}</div>
                                        </div>
                                        <div className="w-3/4 p-4">
                                            {selectedFileContent ? (
                                                <Editor
                                                    height="500px"
                                                    defaultLanguage={"python"}
                                                    language={getLanguageFromFileName(selectedFileContent)}
                                                    value={selectedFileContent}
                                                    options={{
                                                        readOnly: true,
                                                        minimap: {enabled: false},
                                                        scrollBeyondLastLine: false,
                                                    }}
                                                    onMount={(editor) => setCurrentEditor(editor)}
                                                    onChange={renderComments}
                                                    theme="vs-dark"
                                                />
                                            ) : (
                                                <div className="text-gray-500 text-center">Select a file to view its
                                                    content</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-lg">Request peer review</h3>
                                    {reviewerAssigned ? (
                                        <p className="text-sm text-green-500">A reviewer has already been assigned to this submission.</p>
                                    ) : (
                                        <>
                                            <ReviewerCombobox
                                                managers={managers}
                                                selectedReviewer={selectedReviewer}
                                                setSelectedReviewer={setSelectedReviewer}
                                            />
                                            <button
                                                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg mt-4 w-36"
                                                onClick={() => {
                                                    if (selectedReviewer) {
                                                        assignReviewer(id!, selectedReviewer.id)
                                                    } else {
                                                        console.log('Please select a reviewer');
                                                    }
                                                }}
                                            >
                                                Send Request
                                            </button>
                                        </>
                                    )}
                                </div>
                            {/*    Comments*/}
                                <div className="flex flex-col">
                                    <h3 className="text-lg">Comments</h3>
                                    {
                                        comments.map((comment, index) => (
                                            <div key={index}
                                                 className="flex flex-col bg-white bg-opacity-5 rounded-md p-4 mt-4">
                                                <div className="flex justify-between">
                                                    <p className="text-sm font-semibold">{comment.comment.author}</p>
                                                    <p className="text-sm">{convertTimestampToDateTime(parseInt(comment.comment.dt))}</p>
                                                </div>
                                                <p className="text-sm mt-2">{comment.comment.filePath}</p>
                                                <p className="text-sm mt-2">{comment.comment.text}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableCaption>A list of your previous submissions</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-28">Name</TableHead>
                                        <TableHead className="w-36">Status</TableHead>
                                        <TableHead className="w-36">Language</TableHead>
                                        <TableHead className="w-36">Time</TableHead>
                                        <TableHead className="w-36">Assignment</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result, index) => (
                                        <TableRow key={index} onClick={() => navigate(`/results/${result.id}`)} className="cursor-pointer hover:bg-gray-800">
                                            <TableCell>{result.fileName}</TableCell>
                                            <TableCell
                                                className={`font-semibold ${getStatusColor(result.status)}`}>{result.status}</TableCell>
                                            <TableCell>{result.language}</TableCell>
                                            <TableCell>{convertTimestampToDateTime(parseInt(result.timestamp))}</TableCell>
                                            <TableCell>{result.assignment.title}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Results