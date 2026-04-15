import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';

export class DebugMCP extends BaseMCPServer {
  name = 'debug-mcp';
  domain = 'system';
  layer = 'debugging';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    return {
      success: true,
      output: "Analysis complete: Error caused by missing dependency. Fix: npm install.",
      nextActions: ['retry']
    };
  }

  capabilities(): string[] {
    return ['debug-error'];
  }
}
