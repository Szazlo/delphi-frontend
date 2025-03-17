interface AIConfiguration {
    id: string;
    model: string;
    systemPrompt: string;
    analysisPrompt: string;
    temperature: number;
    maxTokens: number;
    active: boolean;
}

class AIConfigurationService {
    private baseUrl = 'http://localhost:8080/api/ai-config';

    async getAllConfigurations(): Promise<AIConfiguration[]> {
        const response = await fetch(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch configurations');
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected array');
        }
        return data;
    }

    async getActiveConfiguration(): Promise<AIConfiguration | null> {
        const response = await fetch(`${this.baseUrl}/active`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            return null;
        }
        return response.json();
    }

    async createConfiguration(config: AIConfiguration): Promise<AIConfiguration> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(config)
        });
        if (!response.ok) {
            throw new Error('Failed to create configuration');
        }
        return response.json();
    }

    async updateConfiguration(id: string, config: AIConfiguration): Promise<AIConfiguration> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(config)
        });
        if (!response.ok) {
            throw new Error('Failed to update configuration');
        }
        return response.json();
    }

    async deleteConfiguration(id: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.ok;
    }

    async setActiveConfiguration(id: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/${id}/activate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.ok;
    }
}

export const aiConfigurationService = new AIConfigurationService(); 