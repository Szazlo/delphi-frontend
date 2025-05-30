import API_URL from "@/Api/APIConfig.tsx";
interface Submission {
    id: string;
    userId: string;
    fileName: string;
    output: string;
    runtime: number;
    memory: number;
    timestamp: string;
    status: string;
    testResults: string;
    aiOutput: string;
}

class SubmissionService {
    async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}/submissions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch submissions');
        }
        return response.json();
    }

    async analyzeSubmissions(assignmentId: string): Promise<string> {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}/submissions/analyze`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to analyze submissions');
        }
        return response.text();
    }
}

export const submissionService = new SubmissionService(); 