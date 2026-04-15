import { Orchestrator } from './mcp-system/orchestrator/orchestrator';

async function testDebug() {
    const orchestrator = new Orchestrator('mcp-system/registry/registry.json');
    const runId = "debug-test-" + Math.random().toString(36).substring(7);
    const context = {
        taskId: 'fail-task',
        runId,
        projectId: 'test-project',
        featureId: 'fail-feature',
        domain: 'test',
        layer: 'test',
        status: 'queued' as any,
        retryCount: 0,
        maxRetries: 1,
        history: [],
        artifacts: []
    };

    console.log("--- Starting Debug Test (Intentional Failure) ---");
    const response = await orchestrator.executeTask({ task: 'FAIL_TASK' }, context);
    console.log("Final Response Success:", response.success);
    console.log("Retry Count:", context.retryCount);
}

testDebug().catch(console.error);
