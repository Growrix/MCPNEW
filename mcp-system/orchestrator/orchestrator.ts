import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import { MCPServer } from '../contracts/mcp-interface';
import { StateManager } from '../../execution-runtime/state/state-manager';
import { SystemValidator } from '../../execution-runtime/validators/system-validator';
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
  private stateManager: StateManager;
  private validator: SystemValidator;

  constructor(registryPath: string) {
    if (fs.existsSync(registryPath)) {
      const content = fs.readFileSync(registryPath, 'utf-8');
      this.registry = JSON.parse(content).mcps;
    }
    this.stateManager = new StateManager();
    this.validator = new SystemValidator();
  }

  async setRegistry(registry: RegistryEntry[]) {
    this.registry = registry;
  }

  async route(request: MCPRequest): Promise<RegistryEntry | null> {
    const capability = request.task;
    return this.registry.find(mcp => mcp.enabled && mcp.capabilities.includes(capability)) || null;
  }

  async executeTask(request: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    this.stateManager.saveContext(context);
    context.status = 'executing';
    this.stateManager.updateStatus(context.runId, 'executing');

    const mcpEntry = await this.route(request);
    if (!mcpEntry) {
      context.status = 'failed';
      this.stateManager.updateStatus(context.runId, 'failed');
      return {
        success: false,
        error: `No enabled MCP found for task: ${request.task}`,
        retryable: false
      };
    }

    try {
      const modulePath = path.resolve(mcpEntry.entry);
      const module = require(modulePath);
      const MCPClass = module[mcpEntry.className];
      const mcpInstance: MCPServer = new MCPClass();

      // Validation Step
      context.status = 'validating';
      this.stateManager.updateStatus(context.runId, 'validating');
      const validation = await mcpInstance.validate(request);
      if (!validation.valid) {
        return this.handleFailure(request, context, `Validation failed: ${validation.errors?.join(', ')}`, true);
      }

      // Execution Step
      context.status = 'executing';
      this.stateManager.updateStatus(context.runId, 'executing');
      const response = await mcpInstance.execute(request, context);

      if (response.success) {
        context.status = 'completed';
        this.stateManager.updateStatus(context.runId, 'completed');
        context.history.push({
            step: request.task,
            status: 'success',
            result: response.output,
            timestamp: new Date().toISOString()
        });
        return response;
      } else {
        return this.handleFailure(request, context, response.error || 'Unknown error', response.retryable ?? true);
      }

    } catch (error: any) {
      return this.handleFailure(request, context, `Execution failed: ${error.message}`, true);
    }
  }

  private async handleFailure(request: MCPRequest, context: ExecutionContext, error: string, retryable: boolean): Promise<MCPResponse> {
    context.history.push({
        step: request.task,
        status: 'failed',
        error: error,
        timestamp: new Date().toISOString()
    });

    if (retryable && context.retryCount < context.maxRetries) {
        context.retryCount++;
        context.status = 'retrying';
        this.stateManager.updateStatus(context.runId, 'retrying');

        // Trigger Debug MCP
        const debugRequest: MCPRequest = {
            task: 'debug-error',
            context: { error, lastTask: request.task }
        };
        const debugResponse = await this.executeTask(debugRequest, { ...context, taskId: 'debug-' + context.taskId });

        if (debugResponse.success && debugResponse.nextActions?.includes('retry')) {
            return this.executeTask(request, context);
        }
    }

    context.status = 'failed';
    this.stateManager.updateStatus(context.runId, 'failed');
    return {
        success: false,
        error: error,
        retryable: false
    };
  }

  async runFullCycle(projectId: string, featureId: string, userIdea: string): Promise<void> {
    const runId = Math.random().toString(36).substring(7);
    const context: ExecutionContext = {
        taskId: 'root',
        runId,
        projectId,
        featureId,
        domain: 'saas',
        layer: 'orchestrator',
        status: 'queued',
        retryCount: 0,
        maxRetries: 3,
        history: [],
        artifacts: []
    };

    console.log(`Starting Full Cycle for Project: ${projectId}, Feature: ${featureId}`);

    // 1. DOC-MCP
    const docResponse = await this.executeTask({ task: 'create-feature-doc', taskDescription: userIdea } as any, context);
    if (!docResponse.success) return;

    // 2. Knowledge-MCP
    await this.executeTask({ task: 'retrieve-knowledge' }, context);

    // 3. Planner-MCP
    const planResponse = await this.executeTask({ task: 'plan-website' }, context);
    if (!planResponse.success) return;

    const plan = planResponse.output;

    // 4. Builder-MCP for each task
    for (const task of plan.tasks) {
        console.log(`Executing task: ${task.title}`);
        await this.executeTask({
            task: task.capability,
            metadata: { projectId, featureId }
        }, context);

        // 5. Validation
        const typeCheck = await this.validator.validateTypes();
        if (!typeCheck.valid) {
            console.error(`Type check failed after task ${task.id}: ${typeCheck.errors?.join(', ')}`);
            // In a real system, this would trigger Debug/Retry
        }
    }

    console.log(`Full Cycle completed for ${featureId}. Status: ${context.status}`);
  }
}
