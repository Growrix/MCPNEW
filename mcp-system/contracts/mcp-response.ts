export interface MCPResponse {
  success: boolean;
  output?: any;
  artifacts?: string[];
  logs?: string[];
  nextActions?: string[];
  error?: string;
  retryable?: boolean;
}
