import { ExecutionContext } from '../contracts/execution-context';

export class StateManager {
  private contexts: Map<string, ExecutionContext> = new Map();

  saveContext(context: ExecutionContext) {
    this.contexts.set(context.runId, context);
    // In real system, write to file in execution-runtime/state/
  }

  getContext(runId: string): ExecutionContext | undefined {
    return this.contexts.get(runId);
  }

  updateStatus(runId: string, status: ExecutionContext['status']) {
    const ctx = this.getContext(runId);
    if (ctx) {
      ctx.status = status;
      this.saveContext(ctx);
    }
  }
}
