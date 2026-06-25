import type { Group } from '@/lib/database';

const STORAGE_PREFIX = 'habit-buddies:dashboard-group-order';

export function groupTabOrderStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function readGroupTabOrder(userId: string): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(groupTabOrderStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function writeGroupTabOrder(userId: string, orderIds: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(groupTabOrderStorageKey(userId), JSON.stringify(orderIds));
}

export function mergeGroupTabOrder(existing: string[], groupIds: string[]) {
  const next = existing.filter((id) => groupIds.includes(id));

  for (const id of groupIds) {
    if (!next.includes(id)) {
      next.push(id);
    }
  }

  return next;
}

export function orderGroupsByTabOrder(groups: Group[], orderIds: string[]) {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const ordered: Group[] = [];

  for (const id of orderIds) {
    const group = byId.get(id);
    if (group) {
      ordered.push(group);
      byId.delete(id);
    }
  }

  for (const group of groups) {
    if (byId.has(group.id)) {
      ordered.push(group);
    }
  }

  return ordered;
}

export function reorderGroupIds(orderIds: string[], fromIndex: number, toIndex: number) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= orderIds.length ||
    toIndex >= orderIds.length
  ) {
    return orderIds;
  }

  const next = [...orderIds];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
