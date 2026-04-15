import { Orchestrator } from './mcp-system/orchestrator/orchestrator';

async function runDemo() {
    const orchestrator = new Orchestrator('mcp-system/registry/registry.json');

    const userIdea = "Build a SaaS landing page with a signup form and a simple dashboard. Use HTML and CSS.";
    const projectId = "saas-demo";
    const featureId = "landing-page-v1";

    console.log("--- Starting E2E Demo ---");
    await orchestrator.runFullCycle(projectId, featureId, userIdea);
    console.log("--- Demo Completed ---");
}

runDemo().catch(console.error);
