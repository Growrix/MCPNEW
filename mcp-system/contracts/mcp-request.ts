export interface MCPRequest {
  task: string;
  goal?: string;
  constraints?: string[];
  context?: any;
  metadata?: {
    featureId?: string;
    projectId?: string;
    priority?: 'low' | 'medium' | 'high';
    requestedBy?: 'user' | 'system' | 'agent';
  };
}
