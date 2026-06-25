import type { RealtimeChannel } from '@supabase/supabase-js';

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;

type SubscribeStatus = 'SUBSCRIBED' | 'CLOSED' | 'TIMED_OUT' | 'CHANNEL_ERROR';

type ResilientSubscribeOptions = {
  onReconnect?: () => void;
};

export function subscribeChannelWithReconnect(
  channel: RealtimeChannel,
  options: ResilientSubscribeOptions = {},
): () => void {
  const onReconnectRef = { current: options.onReconnect };
  onReconnectRef.current = options.onReconnect;

  let disposed = false;
  let hadSubscription = false;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
  };

  const scheduleReconnect = () => {
    if (disposed) {
      return;
    }

    clearReconnectTimer();
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS,
    );
    reconnectAttempt += 1;

    reconnectTimer = setTimeout(() => {
      if (disposed) {
        return;
      }

      void channel.subscribe((status: SubscribeStatus) => {
        handleStatus(status);
      });
    }, delay);
  };

  const handleStatus = (status: SubscribeStatus) => {
    if (disposed) {
      return;
    }

    if (status === 'SUBSCRIBED') {
      reconnectAttempt = 0;
      clearReconnectTimer();

      if (hadSubscription) {
        onReconnectRef.current?.();
      }

      hadSubscription = true;
      return;
    }

    if (status === 'CLOSED' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
      scheduleReconnect();
    }
  };

  void channel.subscribe((status: SubscribeStatus) => {
    handleStatus(status);
  });

  return () => {
    disposed = true;
    clearReconnectTimer();
  };
}
