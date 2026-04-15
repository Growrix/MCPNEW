import { MCPServer } from '../contracts/mcp-interface';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import { ValidationResult } from '../contracts/validation-result';

export class BaseMCPServer implements MCPServer {
  name: string = 'base-mcp';
  domain: string = 'system';
  layer: string = 'base';
  version: string = '1.0.0';

  async validate(input: MCPRequest): Promise<ValidationResult> {
    return { valid: true };
  }

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    return { success: true, output: "Executed successfully" };
  }

  async healthCheck(): Promise<{ success: boolean }> {
    return { success: true };
  }

  capabilities(): string[] {
    return [];
  }
}
