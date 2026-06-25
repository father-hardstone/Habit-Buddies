import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  emitInboxCallEvent,
  INBOX_CALL_EVENTS,
  type InboxCallEvent,
} from '@/lib/inbox-call-bridge';
import { subscribeChannelWithReconnect } from '@/lib/realtime-resilience';
import { getSupabaseClient } from '@/lib/supabase-client';

/** App-wide per-user inbox channel — active across the main layout. */
export const USER_INBOX_CHANNEL_PREFIX = 'inbox';

export function userInboxChannelName(userId: string): string {
  return `${USER_INBOX_CHANNEL_PREFIX}:${userId}`;
}

const CALL_EVENTS: InboxCallEvent[] = INBOX_CALL_EVENTS;

type InboxBroadcastHandler = (event: string, payload: unknown) => void;

type UserInboxChannelState = {
  channel: RealtimeChannel;
  handlers: Set<InboxBroadcastHandler>;
  reconnectHandlers: Set<() => void>;
  unsubscribeResilience: () => void;
  refCount: number;
};

const channelsByUser = new Map<string, UserInboxChannelState>();

function attachInboxListeners(channel: RealtimeChannel, handlers: Set<InboxBroadcastHandler>) {
  const dispatch = (event: string, payload: unknown) => {
    for (const handler of handlers) {
      handler(event, payload);
    }
  };

  channel
    .on('broadcast', { event: 'inbox_update' }, ({ payload }) => {
      dispatch('inbox_update', payload);
    })
    .on('broadcast', { event: 'inbox_read' }, ({ payload }) => {
      dispatch('inbox_read', payload);
    })
    .on('broadcast', { event: 'inbox_peer_read' }, ({ payload }) => {
      dispatch('inbox_peer_read', payload);
    });

  for (const event of CALL_EVENTS) {
    channel.on('broadcast', { event }, ({ payload }) => {
      emitInboxCallEvent(event, payload);
      dispatch(event, payload);
    });
  }
}

function createUserInboxChannel(userId: string): UserInboxChannelState {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const handlers = new Set<InboxBroadcastHandler>();
  const reconnectHandlers = new Set<() => void>();
  const channel = supabase.channel(userInboxChannelName(userId));

  attachInboxListeners(channel, handlers);

  const unsubscribeResilience = subscribeChannelWithReconnect(channel, {
    onReconnect: () => {
      for (const handler of reconnectHandlers) {
        handler();
      }
    },
  });

  return {
    channel,
    handlers,
    reconnectHandlers,
    unsubscribeResilience,
    refCount: 0,
  };
}

/** Keeps one shared inbox subscription alive for the signed-in user. */
export function retainUserInboxChannel(userId: string): () => void {
  if (!userId || !getSupabaseClient()) {
    return () => undefined;
  }

  let state = channelsByUser.get(userId);
  if (!state) {
    state = createUserInboxChannel(userId);
    channelsByUser.set(userId, state);
  }

  state.refCount += 1;

  return () => {
    const current = channelsByUser.get(userId);
    if (!current) {
      return;
    }

    current.refCount -= 1;

    if (current.refCount <= 0) {
      current.unsubscribeResilience();
      void getSupabaseClient()?.removeChannel(current.channel);
      channelsByUser.delete(userId);
    }
  };
}

export function registerUserInboxListener(
  userId: string,
  handler: InboxBroadcastHandler,
  options: { onReconnect?: () => void } = {},
): () => void {
  if (!userId || !getSupabaseClient()) {
    return () => undefined;
  }

  const releaseChannel = retainUserInboxChannel(userId);
  const state = channelsByUser.get(userId);

  if (!state) {
    releaseChannel();
    return () => undefined;
  }

  state.handlers.add(handler);

  if (options.onReconnect) {
    state.reconnectHandlers.add(options.onReconnect);
  }

  return () => {
    state.handlers.delete(handler);

    if (options.onReconnect) {
      state.reconnectHandlers.delete(options.onReconnect);
    }

    releaseChannel();
  };
}

export function sendUserInboxBroadcast(
  userId: string,
  event: string,
  payload: unknown,
): boolean {
  if (!userId) {
    return false;
  }

  let state = channelsByUser.get(userId);

  if (!state) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return false;
    }

    state = createUserInboxChannel(userId);
    state.refCount = 0;
    channelsByUser.set(userId, state);
    void state.channel.subscribe();
  }

  void state.channel.send({
    type: 'broadcast',
    event,
    payload,
  });

  return true;
}
