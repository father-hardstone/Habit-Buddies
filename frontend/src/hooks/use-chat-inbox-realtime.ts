'use client';

import * as React from 'react';
import type {
  RealtimeInboxPayload,
  RealtimeInboxPeerReadPayload,
} from '@/lib/supabase-client';
import { registerUserInboxListener } from '@/lib/user-inbox-channel';

type UseChatInboxRealtimeOptions = {
  onInboxUpdate: (update: RealtimeInboxPayload) => void;
  onInboxRead: (chatId: string) => void;
  onInboxPeerRead: (payload: RealtimeInboxPeerReadPayload) => void;
  onReconnect?: () => void;
};

export function useChatInboxRealtime(
  userId: string,
  options: UseChatInboxRealtimeOptions,
) {
  const onInboxUpdateRef = React.useRef(options.onInboxUpdate);
  const onInboxReadRef = React.useRef(options.onInboxRead);
  const onInboxPeerReadRef = React.useRef(options.onInboxPeerRead);
  const onReconnectRef = React.useRef(options.onReconnect);
  onInboxUpdateRef.current = options.onInboxUpdate;
  onInboxReadRef.current = options.onInboxRead;
  onInboxPeerReadRef.current = options.onInboxPeerRead;
  onReconnectRef.current = options.onReconnect;

  React.useEffect(() => {
    if (!userId) {
      return;
    }

    return registerUserInboxListener(
      userId,
      (event, payload) => {
        switch (event) {
          case 'inbox_update': {
            const data = payload as RealtimeInboxPayload;
            if (data?.chatId) {
              onInboxUpdateRef.current(data);
            }
            break;
          }
          case 'inbox_read': {
            const data = payload as { chatId?: string };
            if (data?.chatId) {
              onInboxReadRef.current(data.chatId);
            }
            break;
          }
          case 'inbox_peer_read': {
            const data = payload as RealtimeInboxPeerReadPayload;
            if (data?.chatId && data.readAt) {
              onInboxPeerReadRef.current(data);
            }
            break;
          }
          default:
            break;
        }
      },
      {
        onReconnect: () => onReconnectRef.current?.(),
      },
    );
  }, [userId]);
}
