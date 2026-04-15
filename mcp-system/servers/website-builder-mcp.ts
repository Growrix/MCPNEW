import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export class WebsiteBuilderMCP extends BaseMCPServer {
  name = 'website-builder-mcp';
  domain = 'webdev';
  layer = 'execution';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    if (input.task === "FAIL_TASK") {
        return { success: false, error: "Intentional failure for testing debug loop", retryable: true };
    }
    const appDir = path.join('apps', context.projectId);
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }

    const taskTitle = input.task;

    // Use aider to actually build the code
    const prompt = `
Build the following task for the SaaS app in the 'apps/${context.projectId}' directory.
Task: ${taskTitle}
Make sure it's functional and uses the existing project structure if any.
`;

    try {
        const tempPromptPath = path.join('/tmp', `prompt-${Date.now()}.txt`);
        fs.writeFileSync(tempPromptPath, prompt);

        const command = `aider --message-file "${tempPromptPath}" --model openrouter/google/gemini-2.0-flash-001 --no-git --yes`;
        execSync(command);

        fs.unlinkSync(tempPromptPath);

        return {
          success: true,
          output: `Built task: ${taskTitle}`,
          artifacts: fs.readdirSync(appDir).map(f => path.join(appDir, f))
        };
    } catch (error: any) {
        return { success: false, error: `AI Building failed: ${error.message}` };
    }
  }

  capabilities(): string[] {
    return ['build-ui', 'build-api'];
  }
}
