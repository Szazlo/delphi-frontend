import './Results.css'
import {useNavigate, useParams} from 'react-router-dom'
import {useEffect, useRef, useState} from 'react'
import {FaFileAlt, FaFolder} from "react-icons/fa";
import {Editor} from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import JSZip from 'jszip'
import {createReviewManager, ReviewCommentState, type ReviewManager, ReviewCommentEvent} from "@/Components/monacoReview";
import {AiOutlineLoading3Quarters} from "react-icons/ai";

import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,} from "@/Components/ui/table"
import {Textarea} from "@/Components/ui/textarea"
import {ReviewerCombobox} from "@/Components/ReviewerCombobox.tsx";
import Topbar from "@/Components/Topbar.tsx";
import Sidebar from "@/Components/Sidebar.tsx";
import {render} from "react-dom";
import ReactMarkdown from "react-markdown";
import {toast} from "sonner";

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
        maxRuntime: number;
        maxMemory: number;
    };
    testResults: string;
    aioutput: string | null;
    grade: number;
}

interface Manager {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface Comment {
    id: string;
    submissionId: string;
    filePath: string;
    lineNumber: number;
    text: string;
    authorId: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
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

    const [reviewRequestType, setReviewRequestType] = useState<'owner' | 'random'>('owner');
    const [randomReviewer, setRandomReviewer] = useState<Manager | null>(null);
    const [group, setGroup] = useState<{id: string; name: string; owner: string; members: string[]} | null>(null);

    const handleEditorMount = (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
        setCurrentEditor(editor);

        // Initialize review manager with default file path
        if (selectedFile) {
            reviewManager = createReviewManager(
                editor,
                localStorage.getItem("name") || "Unknown",
                commentsRef.current[selectedFile] || [],
                (updatedComments) => {
                    commentsRef.current[selectedFile] = updatedComments;
                    renderComments();
                },
                { filePath: selectedFile }
            );
        }
    };

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

    const fetchGroupData = async (submissionId: string) => {
        try {
            const token = localStorage.getItem('token');

            // First, get the submission details
            const submissionResponse = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const submissionData = await submissionResponse.json();
            if (!submissionResponse.ok || !submissionData.assignment?.id) {
                console.error('Failed to get submission or submission has no assignment');
                return;
            }

            // Now get the assignment to find the group ID
            const assignmentResponse = await fetch(`http://localhost:8080/api/assignments/${submissionData.assignment.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const assignmentData = await assignmentResponse.json();
            if (!assignmentResponse.ok || !assignmentData.group.id){
                console.error('Failed to get assignment or assignment has no group');
                return;
            }

            // Now we can fetch the group data
            const groupResponse = await fetch(`http://localhost:8080/api/groups/${assignmentData.group.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!groupResponse.ok) {
                throw new Error('Failed to fetch group data');
            }

            const groupData = await groupResponse.json();

            // And fetch the group members
            const membersResponse = await fetch(`http://localhost:8080/api/groups/${assignmentData.group.id}/users`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!membersResponse.ok) {
                throw new Error('Failed to fetch group members');
            }

            const members = await membersResponse.json();

            setGroup({
                id: assignmentData.groupId,
                name: groupData.name,
                owner: groupData.owner,
                members: members.map((user: any) => user.id)
            });
        } catch (error) {
            console.error('Error fetching group data:', error);
        }
    };

    const assignReviewer = async (submissionId: string, reviewerId?: string) => {
        try {
            const token = localStorage.getItem('token');

            // If no specific reviewer ID is provided and random type is selected,
            // pick a random group member (excluding the current user)
            let actualReviewerId = reviewerId;
            if (reviewRequestType === 'random' && !reviewerId && group?.members.length) {
                const currentUserId = localStorage.getItem('userId');
                const availableMembers = group.members.filter(id => id !== currentUserId);

                if (availableMembers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableMembers.length);
                    actualReviewerId = availableMembers[randomIndex];
                }
            }

            if (!actualReviewerId) {
                console.error('No reviewer ID available');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/submissions/${submissionId}/addreviewer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${token}`
                },
                body: `reviewerId=${actualReviewerId}`
            });

            if (response.status === 200) {
                setReviewerAssigned(true);

                if (reviewRequestType === 'random') {
                    // Try to find user details from API if not in managers list
                    try {
                        const userResponse = await fetch(`http://localhost:8080/api/auth/user/${actualReviewerId}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            setRandomReviewer(userData);
                        } else {
                            // Fallback to managers list
                            const randomReviewerData = managers.find(m => m.id === actualReviewerId);
                            setRandomReviewer(randomReviewerData || null);
                        }
                    } catch (error) {
                        console.error('Error fetching user details:', error);
                        const randomReviewerData = managers.find(m => m.id === actualReviewerId);
                        setRandomReviewer(randomReviewerData || null);
                    }
                }
            } else {
                console.error('Error assigning reviewer:', response);
            }
            toast.success('Reviewer assigned successfully');
        } catch (error) {
            console.error('Error assigning reviewer:', error);
        }
    };

    const fetchComments = async (submissionId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/comments/submission/${submissionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const comments = await response.json();
            return comments;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    };

    const saveComment = async (event: ReviewCommentEvent) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const comment = {
                submissionId: id, // Your submission ID from params
                filePath: event.filePath,
                lineNumber: event.lineNumber,
                text: event.text,
                authorId: userId,
                parentId: event.targetId // For replies
            };

            const response = await fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(comment)
            });

            if (!response.ok) {
                throw new Error('Failed to save comment');
            }

            const savedComment = await response.json();
            return savedComment;
        } catch (error) {
            console.error('Error saving comment:', error);
            throw error;
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8080/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    };

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
                const content = await file.async("text");
                setSelectedFileContent(content);
                setSelectedFile(filePath);

                if (currentEditor) {
                    // Clean up existing review manager if it exists
                    if (reviewManager) {
                        reviewManager.clearAllComments();
                        reviewManager.clearAllViewZonesAndDecorations();
                    }

                    const comments = await fetchComments(id!);
                    const fileComments = comments.filter((comment: Comment) => comment.filePath === filePath);

                    const commentEvents = fileComments.map((c: Comment) => ({
                        type: 'create',
                        id: c.id,
                        lineNumber: c.lineNumber,
                        text: c.text,
                        filePath: c.filePath,
                        createdBy: c.authorId,
                        createdAt: new Date(c.createdAt).getTime(),
                        targetId: c.parentId
                    }));

                    // Initialize new ReviewManager for the selected file
                    reviewManager = createReviewManager(
                        currentEditor,
                        localStorage.getItem("name") || "Unknown",
                        commentEvents,
                        async (updatedComments) => {
                            // Handle comment updates
                            const latestComment = updatedComments[updatedComments.length - 1];
                            if (latestComment.type === 'create') {
                                await saveComment(latestComment);
                            } else if (latestComment.type === 'delete') {
                                await deleteComment(latestComment.targetId);
                            }
                            commentsRef.current[filePath] = updatedComments;
                            renderComments();
                        },
                        { filePath }
                    );
                }
            } else {
                setSelectedFileContent(null);
                setSelectedFile(null);
            }
        }
    };

    const renderComments = () => {
        if (selectedFile && reviewManager) {
            const fileComments = reviewManager.getCommentsForFile(selectedFile);
            setComments(fileComments);
        } else {
            setComments([]);
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

    useEffect(() => {
        if (id) {
            fetchSpecificResult(id);
            fetchReviewerStatus(id);
            fetchGroupData(id);
        } else {
            fetchResults();
        }
        fetchManagers();
    }, [id]);

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

    const renderTestResults = () => {
        if (!specificResult || !specificResult.testResults) {
            return <p className="text-gray-500">No test cases.</p>;
        }

        try {
            const testResults = JSON.parse(specificResult.testResults);
            if (!Array.isArray(testResults) || testResults.length === 0) {
                return <p className="text-gray-500">No test cases.</p>;
            }

            return (
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>Test Results</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Input</TableHead>
                                <TableHead>Expected</TableHead>
                                <TableHead>Actual</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Memory</TableHead>
                                <TableHead>Runtime</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testResults.map((test, index) => {
                                const status = test.status === "Passed" &&
                                (test.runtime > specificResult.assignment.maxRuntime || test.memory > specificResult.assignment.maxMemory)
                                    ? "Failed"
                                    : test.status;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{test.input}</TableCell>
                                        <TableCell>{test.expected}</TableCell>
                                        <TableCell>{test.actual}</TableCell>
                                        <TableCell>
                                        <span className={status === "Passed" ? "text-green-500" : "text-red-500"}>
                                            {status}
                                        </span>
                                        </TableCell>
                                        <TableCell>{test.memory} KB</TableCell>
                                        <TableCell>{test.runtime} ms</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            );
        } catch (error) {
            console.error("Error parsing test results:", error);
            return <p className="text-red-500">Error displaying test results.</p>;
        }
    };

    const renderRunningState = () => (
        <div className="flex items-center space-x-2 text-amber-500">
            <AiOutlineLoading3Quarters className="animate-spin" />
            <span>Running your code... This may take a few minutes.</span>
            <p className="text-sm text-gray-400">Refresh or come back later to see the results.</p>
        </div>
    );

    return (
        <>
            <div className="flex w-screen h-screen">
                <Sidebar/>
                <div className="flex flex-col w-full h-screen">
                    <Topbar/>
                    <div className="flex flex-col p-4 text-white h-full overflow-auto pb-20">
                        {id && specificResult ? (
                            <div className="flex flex-col space-y-4">
                                <div>
                                    <div className="flex justify-between">
                                        <h2 className="text-lg">Results for {specificResult.fileName}</h2>
                                        <p className={`text-md font-semibold ${getStatusColor(specificResult.status)}`}>{specificResult.status}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex">
                                            <p className="text-sm">{convertTimestampToDateTime(parseInt(specificResult.timestamp))}</p>
                                            <p className="text-sm ml-4">{specificResult.language}</p>
                                            <p className="text-sm ml-4">Runtime: {specificResult.runtime} ms</p>
                                            <p className="text-sm ml-4">Memory: {specificResult.memory} KB</p>
                                            <p className="text-sm ml-4">Assignment: {specificResult.assignment.title}</p>
                                        </div>
                                        <p className="text-sm bg-gradient-to-r from-lingrad2 to-lingrad3 bg-clip-text text-transparent">Grade: {specificResult.grade ? specificResult.grade.toFixed(2) : 'N/A'}%</p>
                                    </div>
                                </div>

                                {specificResult.status === 'Running' ? (
                                    <div className="flex justify-center items-center p-8 bg-white bg-opacity-5 rounded-md shadow-md">
                                        {renderRunningState()}
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-lg">Execution Output</h3>
                                            <div className="bg-white bg-opacity-5 rounded-md shadow-md p-4">
                                                <Textarea
                                                    ref={outputRef}
                                                    value={specificResult.output}
                                                    readOnly
                                                    className="w-full resize-none overflow-hidden border-0 bg-transparent text-gray-300 font-mono text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg">Test Results</h3>
                                            <div className="bg-white bg-opacity-5 rounded-md shadow-md p-4">
                                                {renderTestResults()}
                                            </div>
                                        </div>

                                        {specificResult.aioutput && (
                                            <div>
                                                <h3 className="text-lg">AI Analysis & Feedback</h3>
                                                <p className="text-sm text-gray-400">Remember these suggestions are just recommendation, not necessarily the best solution.
                                                    Use your own judgement to decide whether to apply them or not and/or which ones to apply.
                                                    If you feel that the suggestions are incorrect, please ignore them and request a peer review instead.
                                                </p>
                                                <div className="bg-white bg-opacity-5 rounded-md shadow-md p-4">
                                                    <ReactMarkdown className="text-gray-300 font-mono text-sm">
                                                        {specificResult.aioutput}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}

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
                                                            onMount={handleEditorMount}
                                                            onChange={renderComments}
                                                            theme="vs-dark"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-500 text-center">Select a file to view its content</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-lg">Request peer review</h3>
                                            {reviewerAssigned ? (
                                                <p className="text-sm text-green-500">
                                                    A reviewer has been assigned to this submission.
                                                    {randomReviewer && reviewRequestType === 'random' && (
                                                        <span> Random reviewer selected: {randomReviewer.firstName} {randomReviewer.lastName}</span>
                                                    )}
                                                </p>
                                            ) : (
                                                <>
                                                    <div className="flex space-x-4 mb-4">
                                                        <div
                                                            className={`cursor-pointer p-2 rounded-md ${reviewRequestType === 'owner' ? 'bg-blue-500' : 'bg-white bg-opacity-10'}`}
                                                            onClick={() => setReviewRequestType('owner')}
                                                        >
                                                            <span>Group Owner</span>
                                                        </div>
                                                        <div
                                                            className={`cursor-pointer p-2 rounded-md ${reviewRequestType === 'random' ? 'bg-blue-500' : 'bg-white bg-opacity-10'}`}
                                                            onClick={() => setReviewRequestType('random')}
                                                        >
                                                            <span>Random Group Member</span>
                                                        </div>
                                                    </div>

                                                    {reviewRequestType === 'owner' ? (
                                                        <>
                                                            <p className="text-sm text-gray-400 mb-2">
                                                                {group ? `Request review from group owner${group.owner === localStorage.getItem('userId') ? ' (You)' : ''}` : 'Loading group information...'}
                                                            </p>
                                                            <button
                                                                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-2 py-1 rounded-lg mt-2 w-36"
                                                                onClick={() => {
                                                                    if (group) {
                                                                        assignReviewer(id!, group.owner);
                                                                    }
                                                                }}
                                                                disabled={!group || group.owner === localStorage.getItem('userId')}
                                                            >
                                                                Request Owner Review
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-400 mb-2">
                                                                {group ? 'This will select a random member from the group' : 'Loading group information...'}
                                                            </p>
                                                            <button
                                                                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-2 py-1 rounded-lg mt-2 w-36"
                                                                onClick={() => {
                                                                    if (group) {
                                                                        assignReviewer(id!);
                                                                    }
                                                                }}
                                                                disabled={!group || group.members.length <= 1}
                                                            >
                                                                Request Random Review
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col w-full space-y-4 justify-start items-start">
                                <h1 className="text-gray-300 text-2xl">Submissions</h1>
                                <Table>
                                    {results.length === 0 && (
                                    <TableCaption>No previous submissions.</TableCaption>
                                    ) || (
                                    <TableCaption>Results of previous submissions</TableCaption>
                                    )}
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
                                            <TableRow key={index} onClick={() => navigate(`/results/${result.id}`)}
                                                      className="cursor-pointer hover:bg-gray-800">
                                                <TableCell>{result.fileName}</TableCell>
                                                <TableCell className={`font-semibold ${getStatusColor(result.status)}`}>
                                                    <div className="flex items-center space-x-2">
                                                        {result.status === 'Running' ? (
                                                            <>
                                                                <AiOutlineLoading3Quarters className="animate-spin" />
                                                                <span>Running</span>
                                                            </>
                                                        ) : (
                                                            result.status
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{result.language}</TableCell>
                                                <TableCell>{convertTimestampToDateTime(parseInt(result.timestamp))}</TableCell>
                                                <TableCell>{result.assignment.title}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Results