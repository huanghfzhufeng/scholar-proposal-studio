import assert from 'node:assert/strict';
import test from 'node:test';
import { workflowTransitions } from '../src/orchestrator/transitions';

test('workflow transitions keep linear order for MVP pipeline', () => {
  assert.deepEqual(workflowTransitions.INTERVIEW, ['OUTLINE_CANDIDATES']);
  assert.deepEqual(workflowTransitions.OUTLINE_CANDIDATES, ['OUTLINE_LOCKED']);
  assert.deepEqual(workflowTransitions.OUTLINE_LOCKED, ['SOURCES_READY']);
  assert.deepEqual(workflowTransitions.SOURCES_READY, ['DRAFT_READY']);
  assert.deepEqual(workflowTransitions.DRAFT_READY, ['EXPORTABLE']);
  assert.deepEqual(workflowTransitions.EXPORTABLE, []);
});
