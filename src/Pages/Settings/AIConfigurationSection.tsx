import { useState, useEffect } from 'react';
import { aiConfigurationService } from '@/Api/aiConfigService';
import { Input } from "@/Components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { Textarea } from "@/Components/ui/textarea";
import { Card } from "@/Components/ui/card";
import { toast } from "sonner";

interface AIConfiguration {
    id: string;
    model: string;
    systemPrompt: string;
    analysisPrompt: string;
    temperature: number;
    maxTokens: number;
    active: boolean;
}

export function AIConfigurationSection() {
    const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
    const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeConfig, setActiveConfig] = useState<AIConfiguration | null>(null);

    const fetchConfigurations = async () => {
        try {
            const configs = await aiConfigurationService.getAllConfigurations();
            console.log('Fetched configurations:', configs); // Debug log
            if (!Array.isArray(configs)) {
                console.error('Configurations is not an array:', configs);
                return;
            }
            setConfigurations(configs);
            const active = configs.find(config => config.active);
            setActiveConfig(active || null);
        } catch (error) {
            console.error('Error fetching configurations:', error);
            toast.error("Failed to fetch AI configurations");
        }
    };

    useEffect(() => {
        fetchConfigurations();
    }, []);

    const handleSave = async (config: AIConfiguration) => {
        try {
            if (config.id) {
                await aiConfigurationService.updateConfiguration(config.id, config);
            } else {
                await aiConfigurationService.createConfiguration(config);
            }
            fetchConfigurations();
            setEditingConfig(null);
            setIsCreating(false);
            toast.success(`Configuration ${config.id ? 'updated' : 'created'} successfully`);
        } catch (error) {
            toast.error(`Failed to ${config.id ? 'update' : 'create'} configuration`);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await aiConfigurationService.deleteConfiguration(id);
            fetchConfigurations();
            toast.success("Configuration deleted successfully");
        } catch (error) {
            toast.error("Failed to delete configuration");
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await aiConfigurationService.setActiveConfiguration(id);
            fetchConfigurations();
            toast.success("Configuration activated successfully");
        } catch (error) {
            toast.error("Failed to activate configuration");
        }
    };

    const ConfigurationForm = ({ config, onSave, onCancel }: { 
        config: Partial<AIConfiguration>, 
        onSave: (config: any) => void,
        onCancel: () => void 
    }) => {
        const [formData, setFormData] = useState<Partial<AIConfiguration>>(config);

        const handleInputChange = (field: keyof AIConfiguration, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        return (
            <Card className="p-4 space-y-4 bg-white bg-opacity-5">
                <div className="space-y-2">
                    <label className="block text-white text-sm font-bold mb-2">Model</label>
                    <Input
                        value={formData.model || ''}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="e.g., gpt-4"
                        className="bg-white text-gray-700"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-white text-sm font-bold mb-2">System Prompt</label>
                    <Textarea
                        value={formData.systemPrompt || ''}
                        onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                        placeholder="Enter system prompt"
                        className="min-h-[100px] bg-white text-gray-700"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-white text-sm font-bold mb-2">Analysis Prompt</label>
                    <Textarea
                        value={formData.analysisPrompt || ''}
                        onChange={(e) => handleInputChange('analysisPrompt', e.target.value)}
                        placeholder="Enter analysis prompt"
                        className="min-h-[100px] bg-white text-gray-700"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-white text-sm font-bold mb-2">Temperature</label>
                    <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={formData.temperature || 0}
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                        className="bg-white text-gray-700"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-white text-sm font-bold mb-2">Max Tokens</label>
                    <Input
                        type="number"
                        value={formData.maxTokens || 0}
                        onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                        className="bg-white text-gray-700"
                    />
                </div>
                
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={formData.active || false}
                        onCheckedChange={(checked) => handleInputChange('active', checked)}
                    />
                    <label className="text-white text-sm font-bold">Active</label>
                </div>
                
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onCancel} className="bg-gray-700 text-white hover:bg-gray-600">
                        Cancel
                    </Button>
                    <Button onClick={() => onSave(formData)} className="bg-blue-500 hover:bg-blue-700 text-white">
                        Save
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">AI Configurations</h2>
                    {activeConfig && (
                        <p className="text-sm text-gray-300 mt-1">
                            Active Model: {activeConfig.model}
                        </p>
                    )}
                </div>
                <Button 
                    onClick={() => {
                        setIsCreating(true);
                        setEditingConfig({
                            model: '',
                            systemPrompt: '',
                            analysisPrompt: '',
                            temperature: 0.7,
                            maxTokens: 2000,
                            active: false
                        } as AIConfiguration);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white"
                >
                    Add Configuration
                </Button>
            </div>

            {(isCreating || editingConfig) && (
                <ConfigurationForm
                    config={editingConfig || {}}
                    onSave={handleSave}
                    onCancel={() => {
                        setEditingConfig(null);
                        setIsCreating(false);
                    }}
                />
            )}

            <div className="space-y-4">
                {configurations.map((config) => (
                    <Card key={config.id} className="p-4 bg-white bg-opacity-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{config.model}</h3>
                                <p className="text-sm text-gray-300">{config.active ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div className="flex space-x-2">
                                {!config.active && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleActivate(config.id)}
                                        className="bg-green-500 hover:bg-green-700 text-white"
                                    >
                                        Activate
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingConfig(config);
                                    }}
                                    className="bg-gray-700 text-white hover:bg-gray-600"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(config.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-white"><strong>Temperature:</strong> {config.temperature}</p>
                            <p className="text-sm text-white"><strong>Max Tokens:</strong> {config.maxTokens}</p>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white">System Prompt:</p>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{config.systemPrompt}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white">Analysis Prompt:</p>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{config.analysisPrompt}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 