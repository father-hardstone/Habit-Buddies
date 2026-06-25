'use client';

import * as React from 'react';
import type { Group } from '@/lib/database';
import {
  mergeGroupTabOrder,
  orderGroupsByTabOrder,
  readGroupTabOrder,
  reorderGroupIds,
  writeGroupTabOrder,
} from '@/lib/group-tab-order';

export function useGroupTabOrder(userId: string | undefined, groups: Group[]) {
  const [orderIds, setOrderIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!userId) {
      setOrderIds([]);
      return;
    }

    setOrderIds(readGroupTabOrder(userId));
  }, [userId]);

  React.useEffect(() => {
    if (groups.length === 0) {
      return;
    }

    setOrderIds((current) => {
      const merged = mergeGroupTabOrder(current, groups.map((group) => group.id));
      if (userId && merged.join(',') !== current.join(',')) {
        writeGroupTabOrder(userId, merged);
      }
      return merged;
    });
  }, [groups, userId]);

  const orderedGroups = React.useMemo(
    () => orderGroupsByTabOrder(groups, orderIds),
    [groups, orderIds],
  );

  const reorderGroups = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      setOrderIds((current) => {
        const next = reorderGroupIds(current, fromIndex, toIndex);
        if (userId) {
          writeGroupTabOrder(userId, next);
        }
        return next;
      });
    },
    [userId],
  );

  return {
    orderedGroups,
    reorderGroups,
  };
}
