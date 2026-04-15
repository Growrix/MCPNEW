import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import * as fs from 'fs';
import * as path from 'path';

export class WebsitePlannerMCP extends BaseMCPServer {
  name = 'website-planner-mcp';
  domain = 'webdev';
  layer = 'planning';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    const plan = {
      pages: ['home', 'login', 'dashboard'],
      tasks: [
        { id: '1', title: 'Setup project', type: 'build', capability: 'build-ui' },
        { id: '2', title: 'Create login page', type: 'build', capability: 'build-ui' }
      ]
    };

    const projectDir = path.join('docs/projects', context.projectId, 'features', context.featureId);
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }

    fs.writeFileSync(path.join(projectDir, 'execution.json'), JSON.stringify(plan, null, 2));

    return {
      success: true,
      output: plan,
      artifacts: [path.join(projectDir, 'execution.json')]
    };
  }

  capabilities(): string[] {
    return ['plan-website'];
  }
}
