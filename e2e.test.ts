import { expect, test } from 'vitest';
import { Orchestrator, RegistryEntry } from './mcp-system/orchestrator/orchestrator';
import { WebsitePlannerMCP } from './mcp-system/servers/website-planner-mcp';

test('Orchestrator can route to WebsitePlannerMCP', async () => {
  const orchestrator = new Orchestrator('mcp-system/registry/registry.json');
  const planner = new WebsitePlannerMCP();

  const registry: RegistryEntry[] = [{
    name: planner.name,
    domain: planner.domain,
    layer: planner.layer,
    version: planner.version,
    entry: 'mcp-system/servers/website-planner-mcp.ts',
    enabled: true,
    capabilities: planner.capabilities(),
    inputSchema: '',
    outputSchema: ''
  }];

  await orchestrator.setRegistry(registry);

  const route = await orchestrator.route({ task: 'plan-website' });
  expect(route).not.toBeNull();
  expect(route?.name).toBe('website-planner-mcp');
});
