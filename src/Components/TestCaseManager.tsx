import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Input } from '@/Components/ui/input';

interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    assignmentId: string;
    description: string;
}

interface TestCaseManagerProps {
    assignmentId: string;
}

const TestCaseManager: React.FC<TestCaseManagerProps> = ({ assignmentId }) => {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTestCase, setCurrentTestCase] = useState<Partial<TestCase>>({
        input: '',
        expectedOutput: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTestCases();
    }, [assignmentId]);

    const fetchTestCases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/testcases/assignment/${assignmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch test cases');
            }
            const data = await response.json();
            setTestCases(data);
        } catch (error) {
            console.error('Error fetching test cases:', error);
            setError('Failed to load test cases');
        }
    };

    const handleOpenAddDialog = () => {
        setCurrentTestCase({ input: '', expectedOutput: '', description: '', assignmentId });
        setIsEditing(false);
        setIsDialogOpen(true);
        setError('');
    };

    const handleOpenEditDialog = (testCase: TestCase) => {
        setCurrentTestCase(testCase);
        setIsEditing(true);
        setIsDialogOpen(true);
        setError('');
    };

    const handleSaveTestCase = async () => {
        try {
            if (!currentTestCase.description) {
                setError('Please provide a description for the test case');
                return;
            }

            const token = localStorage.getItem('token');
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:8080/api/testcases/${currentTestCase.id}`
                : `http://localhost:8080/api/testcases`;

            const body = isEditing
                ? { ...currentTestCase }
                : { ...currentTestCase, assignmentId };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'create'} test case`);
            }

            const savedTestCase = await response.json();

            if (isEditing) {
                setTestCases(testCases.map(tc => tc.id === savedTestCase.id ? savedTestCase : tc));
            } else {
                setTestCases([...testCases, savedTestCase]);
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving test case:', error);
            setError((error as Error).message);
        }
    };

    const handleDeleteTestCase = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this test case?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/testcases/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete test case');
            }

            setTestCases(testCases.filter(testCase => testCase.id !== id));
        } catch (error) {
            console.error('Error deleting test case:', error);
            setError((error as Error).message);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setCurrentTestCase({
            ...currentTestCase,
            [field]: value
        });
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-300">Test Cases</h2>
                <Button onClick={handleOpenAddDialog} className="bg-success hover:bg-opacity-80">
                    Add Test Case
                </Button>
            </div>

            {error && <p className="text-error mb-4">{error}</p>}

            {testCases.length > 0 ? (
                <div className="rounded-md border border-gray-600 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white bg-opacity-5">
                                <TableHead className="text-gray-300 w-1/4">Description</TableHead>
                                <TableHead className="text-gray-300 w-1/3">Input</TableHead>
                                <TableHead className="text-gray-300 w-1/3">Expected Output</TableHead>
                                <TableHead className="text-gray-300 w-1/12 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testCases.map((testCase) => (
                                <TableRow key={testCase.id} className="border-t border-gray-600">
                                    <TableCell className="text-gray-300 font-medium">
                                        {testCase.description || <span className="text-gray-500 italic">No description</span>}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <pre className="whitespace-pre-wrap break-all">{testCase.input}</pre>
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <pre className="whitespace-pre-wrap break-all">{testCase.expectedOutput}</pre>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                onClick={() => handleOpenEditDialog(testCase)}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteTestCase(testCase.id)}
                                                className="bg-error hover:bg-red-600"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-gray-300">No test cases available. Add one to get started.</p>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-gray-300">
                            {isEditing ? 'Edit Test Case' : 'Add Test Case'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="bg-white bg-opacity-5 p-4 rounded shadow-lg text-white">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                    Description
                                </label>
                                <Input
                                    id="description"
                                    placeholder="Short name or description (e.g., 'Empty Array Test')"
                                    value={currentTestCase.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full bg-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="input" className="block text-sm font-medium text-gray-300 mb-1">
                                    Input
                                </label>
                                <Textarea
                                    id="input"
                                    placeholder="Test case input"
                                    value={currentTestCase.input || ''}
                                    onChange={(e) => handleInputChange('input', e.target.value)}
                                    className="w-full bg-transparent border-gray-600 resize-y min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label htmlFor="expectedOutput" className="block text-sm font-medium text-gray-300 mb-1">
                                    Expected Output
                                </label>
                                <Textarea
                                    id="expectedOutput"
                                    placeholder="Expected output"
                                    value={currentTestCase.expectedOutput || ''}
                                    onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
                                    className="w-full bg-transparent border-gray-600 resize-y min-h-[100px]"
                                />
                            </div>
                        </div>

                        {error && <p className="text-error mt-2">{error}</p>}

                        <div className="flex justify-end mt-4 space-x-2">
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                className="bg-gray-600 hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveTestCase}
                                className="bg-success hover:bg-opacity-80"
                            >
                                {isEditing ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TestCaseManager;