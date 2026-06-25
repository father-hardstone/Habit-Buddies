const TERMINATED_TTL_MS = 2 * 60 * 1000;

const terminatedCalls = new Map<string, number>();

function pruneTerminatedCalls(now = Date.now()): void {
  const cutoff = now - TERMINATED_TTL_MS;

  for (const [callId, timestamp] of terminatedCalls) {
    if (timestamp < cutoff) {
      terminatedCalls.delete(callId);
    }
  }
}

export function markCallTerminated(callId: string | undefined | null): void {
  if (!callId) {
    return;
  }

  pruneTerminatedCalls();
  terminatedCalls.set(callId, Date.now());
}

export function isCallTerminated(callId: string | undefined | null): boolean {
  if (!callId) {
    return false;
  }

  const timestamp = terminatedCalls.get(callId);
  if (!timestamp) {
    return false;
  }

  if (Date.now() - timestamp > TERMINATED_TTL_MS) {
    terminatedCalls.delete(callId);
    return false;
  }

  return true;
}
