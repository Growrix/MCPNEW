export interface ExecutionContext {
  taskId: string;
  runId: string;
  projectId: string;
  featureId: string;
  domain: string;
  layer: string;
  status:
    | 'queued'
    | 'planning'
    | 'executing'
    | 'validating'
    | 'retrying'
    | 'blocked'
    | 'completed'
    | 'failed';
  retryCount: number;
  maxRetries: number;
  history: {
    step: string;
    status: 'success' | 'failed' | 'skipped';
    result?: any;
    error?: string;
    timestamp: string;
  }[];
  artifacts: string[];
  knowledge?: any;
  constraints?: string[];
}
