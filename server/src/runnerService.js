import { v4 as uuidv4 } from 'uuid';
import { redisClient, KEYS } from './redis.js';

/**
 * Get current state from Redis
 */
export async function getState() {
  const stateJson = await redisClient.get(KEYS.STATE);
  if (!stateJson) {
    return { runners: {} };
  }
  return JSON.parse(stateJson);
}

/**
 * Save state to Redis
 */
async function saveState(state) {
  await redisClient.set(KEYS.STATE, JSON.stringify(state));
}

/**
 * Log event to Redis
 */
async function logEvent(event) {
  const eventWithId = {
    event_id: uuidv4(),
    ts: Date.now(),
    ...event
  };
  
  // Push to events list and trim to last 1000 events
  await redisClient.lpush(KEYS.EVENTS, JSON.stringify(eventWithId));
  await redisClient.ltrim(KEYS.EVENTS, 0, 999);
  
  return eventWithId;
}

/**
 * Add a new runner
 * Status: warming
 */
export async function addRunner(name, actor = 'system') {
  const state = await getState();
  
  const runner = {
    id: uuidv4(),
    name,
    status: 'warming',
    start_ts: Date.now(),
    queue_ts: null,
    end_ts: null,
    created_by: actor,
    last_modified_by: actor
  };
  
  state.runners[runner.id] = runner;
  await saveState(state);
  
  await logEvent({
    type: 'add',
    runner_id: runner.id,
    actor,
    data: { name }
  });
  
  return runner;
}

/**
 * Move a runner to a different status
 * Validates state transitions and sets appropriate timestamps
 */
export async function moveRunner(id, toStatus, actor = 'system') {
  const state = await getState();
  const runner = state.runners[id];
  
  if (!runner) {
    return { error: 'Runner not found', id };
  }
  
  const fromStatus = runner.status;
  
  // Validate transition (optional, can allow any transition)
  const validStatuses = ['warming', 'queue', 'done'];
  if (!validStatuses.includes(toStatus)) {
    return { error: 'Invalid status', toStatus };
  }
  
  // Update runner
  const now = Date.now();
  runner.status = toStatus;
  runner.last_modified_by = actor;
  
  // Set timestamps based on status
  if (toStatus === 'queue' && !runner.queue_ts) {
    runner.queue_ts = now;
  } else if (toStatus === 'done' && !runner.end_ts) {
    runner.end_ts = now;
  }
  
  state.runners[id] = runner;
  await saveState(state);
  
  await logEvent({
    type: 'move',
    runner_id: id,
    from: fromStatus,
    to: toStatus,
    actor
  });
  
  return { runner, from: fromStatus, to: toStatus };
}

/**
 * Remove a runner permanently
 */
export async function removeRunner(id, actor = 'system') {
  const state = await getState();
  const runner = state.runners[id];
  
  if (!runner) {
    return { error: 'Runner not found', id };
  }
  
  delete state.runners[id];
  await saveState(state);
  
  await logEvent({
    type: 'remove',
    runner_id: id,
    actor,
    data: { name: runner.name, status: runner.status }
  });
  
  return { success: true, id };
}

/**
 * Get event log (for debugging/admin)
 */
export async function getEvents(limit = 100) {
  const events = await redisClient.lrange(KEYS.EVENTS, 0, limit - 1);
  return events.map(e => JSON.parse(e));
}