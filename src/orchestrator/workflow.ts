import type { WorkflowState } from '@/orchestrator/transitions';
import { workflowTransitions } from '@/orchestrator/transitions';

export class WorkflowOrchestrator {
  private state: WorkflowState = 'INTERVIEW';

  getState() {
    return this.state;
  }

  transition(nextState: WorkflowState) {
    const allowed = workflowTransitions[this.state];

    if (!allowed.includes(nextState)) {
      throw new Error(`Invalid transition: ${this.state} -> ${nextState}`);
    }

    this.state = nextState;
    return this.state;
  }
}
