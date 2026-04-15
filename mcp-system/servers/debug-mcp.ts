import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class DebugMCP extends BaseMCPServer {
  name = 'debug-mcp';
  domain = 'system';
  layer = 'debugging';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    const error = input.context?.error;
    const lastTask = input.context?.lastTask;

    const prompt = `
The system encountered an error while executing task: "${lastTask}".
Error: ${error}

Analyze the error and provide a fix strategy.
If the error is fixable by running a command or modifying code, suggest "retry" as the next action.
Output ONLY the fix strategy and the next action in JSON format:
{
  "strategy": "...",
  "nextActions": ["retry"]
}
`;

    try {
        const tempPromptPath = path.join('/tmp', `prompt-${Date.now()}.txt`);
        fs.writeFileSync(tempPromptPath, prompt);

        const command = `aider --message-file "${tempPromptPath}" --model openrouter/google/gemini-2.0-flash-001 --no-git --yes`;
        const output = execSync(command).toString();

        fs.unlinkSync(tempPromptPath);

        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not parse JSON from AI response");
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return {
          success: true,
          output: analysis.strategy,
          nextActions: analysis.nextActions
        };
    } catch (e: any) {
        return {
            success: false,
            error: `Debugging failed: ${e.message}`
        };
    }
  }

  capabilities(): string[] {
    return ['debug-error'];
  }
}
