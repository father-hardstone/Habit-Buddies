'use client';

import * as React from 'react';
import {
  getSupabaseClient,
  type RealtimeInboxPayload,
  type RealtimeInboxPeerReadPayload,
} from '@/lib/supabase-client';
import { emitInboxCallEvent, INBOX_CALL_EVENTS } from '@/lib/inbox-call-bridge';

type UseChatInboxRealtimeOptions = {
  onInboxUpdate: (update: RealtimeInboxPayload) => void;
  onInboxRead: (chatId: string) => void;
  onInboxPeerRead: (payload: RealtimeInboxPeerReadPayload) => void;
};

export function useChatInboxRealtime(
  userId: string,
  options: UseChatInboxRealtimeOptions,
) {
  const onInboxUpdateRef = React.useRef(options.onInboxUpdate);
  const onInboxReadRef = React.useRef(options.onInboxRead);
  const onInboxPeerReadRef = React.useRef(options.onInboxPeerRead);
  onInboxUpdateRef.current = options.onInboxUpdate;
  onInboxReadRef.current = options.onInboxRead;
  onInboxPeerReadRef.current = options.onInboxPeerRead;

  React.useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !userId) {
      return;
    }

    const channel = supabase.channel(`inbox:${userId}`);

    channel
      .on('broadcast', { event: 'inbox_update' }, ({ payload }) => {
        const data = payload as RealtimeInboxPayload;
        if (!data?.chatId) {
          return;
        }

        onInboxUpdateRef.current(data);
      })
      .on(
        'broadcast',
        { event: 'inbox_read' },
        ({ payload }: { payload: { chatId?: string } }) => {
          if (!payload?.chatId) {
            return;
          }

          onInboxReadRef.current(payload.chatId);
        },
      )
      .on(
        'broadcast',
        { event: 'inbox_peer_read' },
        ({ payload }: { payload: RealtimeInboxPeerReadPayload }) => {
          if (!payload?.chatId || !payload.readAt) {
            return;
          }

          onInboxPeerReadRef.current(payload);
        },
      );

    for (const event of INBOX_CALL_EVENTS) {
      channel.on('broadcast', { event }, ({ payload }) => {
        emitInboxCallEvent(event, payload);
      });
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
