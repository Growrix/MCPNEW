import { MCPRequest } from './mcp-request';
import { MCPResponse } from './mcp-response';
import { ValidationResult } from './validation-result';
import { ExecutionContext } from './execution-context';

export interface MCPServer {
  name: string;
  domain: string;
  layer: string;
  version: string;

  validate(input: MCPRequest): Promise<ValidationResult>;
  execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse>;
  healthCheck(): Promise<{ success: boolean; details?: any }>;
  capabilities(): string[];
}
