import { BaseMCPServer } from './base-mcp';
import { MCPRequest } from '../contracts/mcp-request';
import { MCPResponse } from '../contracts/mcp-response';
import { ExecutionContext } from '../contracts/execution-context';
import * as fs from 'fs';
import * as path from 'path';

export class DocMCP extends BaseMCPServer {
  name = 'doc-mcp';
  domain = 'documentation';
  layer = 'planning';

  async execute(input: MCPRequest, context: ExecutionContext): Promise<MCPResponse> {
    // Input task is expected to be a user idea/description
    const idea = (input as any).taskDescription || input.task;
    const projectDir = path.join('docs/projects', context.projectId, 'features', context.featureId);

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const featureMdPath = path.join(projectDir, 'feature.md');

    // In a real scenario, we'd use LLM here. For now, we'll create a template
    const content = `---
title: ${context.featureId}
domain: ${context.domain}
status: planned
priority: medium
owner: orchestrator
depends_on: []
acceptance_tests:
   - Feature is functional
---

# Problem
${idea}

# Goal
Implement the feature based on the problem description.
`;

    fs.writeFileSync(featureMdPath, content);

    return {
      success: true,
      output: { featureMdPath },
      artifacts: [featureMdPath],
      nextActions: ['plan-website']
    };
  }

  capabilities(): string[] {
    return ['create-feature-doc'];
  }
}
