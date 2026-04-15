import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export class WebsitePlannerMCP extends BaseMCPServer {
  name = 'website-planner-mcp';
  domain = 'webdev';
  layer = 'planning';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    const projectDir = path.join('docs/projects', context.projectId, 'features', context.featureId);
    const featureMdPath = path.join(projectDir, 'feature.md');

    if (!fs.existsSync(featureMdPath)) {
        return { success: false, error: "feature.md not found. Run doc-mcp first." };
    }

    const featureMd = fs.readFileSync(featureMdPath, 'utf-8');

    // Call LLM via aider to generate execution.json
    const prompt = `
Analyze the following feature.md and generate a JSON task list for building this feature.
Output ONLY the JSON in the format:
{
  "pages": ["page1", "page2"],
  "tasks": [
    { "id": "task1", "title": "...", "type": "build", "capability": "build-ui" }
  ]
}

Feature Documentation:
${featureMd}
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

        const plan = JSON.parse(jsonMatch[0]);
        const executionJsonPath = path.join(projectDir, 'execution.json');
        fs.writeFileSync(executionJsonPath, JSON.stringify(plan, null, 2));

        return {
          success: true,
          output: plan,
          artifacts: [executionJsonPath]
        };
    } catch (error: any) {
        return { success: false, error: `AI Planning failed: ${error.message}` };
    }
  }

  capabilities(): string[] {
    return ['plan-website'];
  }
}
