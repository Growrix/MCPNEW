import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import * as fs from 'fs';
import * as path from 'path';

export class WebsiteBuilderMCP extends BaseMCPServer {
  name = 'website-builder-mcp';
  domain = 'webdev';
  layer = 'execution';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    const appDir = path.join('apps', context.projectId);
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
    }

    const filePath = path.join(appDir, 'index.html');
    fs.writeFileSync(filePath, `<html><body><h1>${input.task}</h1></body></html>`);

    return {
      success: true,
      output: `Built feature for ${input.task}`,
      artifacts: [filePath]
    };
  }

  capabilities(): string[] {
    return ['build-ui', 'build-api'];
  }
}
