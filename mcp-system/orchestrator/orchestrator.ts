import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import { MCPServer } from '../contracts/mcp-interface';
import * as fs from 'fs';
import * as path from 'path';

export interface RegistryEntry {
  name: string;
  domain: string;
  layer: string;
  version: string;
  entry: string;
  enabled: boolean;
  capabilities: string[];
  inputSchema: string;
  outputSchema: string;
  className: string;
}

export class Orchestrator {
  private registry: RegistryEntry[] = [];

  constructor(registryPath: string) {
    if (fs.existsSync(registryPath)) {
      const content = fs.readFileSync(registryPath, 'utf-8');
      this.registry = JSON.parse(content).mcps;
    }
  }

  async setRegistry(registry: RegistryEntry[]) {
    this.registry = registry;
  }

  async route(request: MCPRequest): Promise<RegistryEntry | null> {
    const capability = request.task;
    return this.registry.find(mcp => mcp.enabled && mcp.capabilities.includes(capability)) || null;
  }

  async executeTask(request: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    const mcpEntry = await this.route(request);
    if (!mcpEntry) {
      return {
        success: false,
        error: `No enabled MCP found for task: ${request.task}`,
        retryable: false
      };
    }

    try {
      const modulePath = path.resolve(mcpEntry.entry);
      const module = await import(modulePath);
      const MCPClass = module[mcpEntry.className];
      const mcpInstance: MCPServer = new MCPClass();

      const validation = await mcpInstance.validate(request);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.join(', ')}`,
          retryable: false
        };
      }

      return await mcpInstance.execute(request, context);
    } catch (error: any) {
      return {
        success: false,
        error: `Execution failed: ${error.message}`,
        retryable: true
      };
    }
  }
}
