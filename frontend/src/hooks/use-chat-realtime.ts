'use client';

import * as React from 'react';
import {
  getSupabaseClient,
  type RealtimeChatMessagePayload,
} from '@/lib/supabase-client';
import { registerChatBroadcastSender } from '@/lib/chat-broadcast-bridge';
import { subscribeChannelWithReconnect } from '@/lib/realtime-resilience';
import type { ChatMessage } from '@/lib/database';

const TYPING_HIDE_MS = 2500;
const TYPING_SEND_INTERVAL_MS = 2000;

type ChatCallRealtimeEvent =
  | 'call_invite'
  | 'call_accept'
  | 'call_decline'
  | 'call_cancel'
  | 'call_end'
  | 'call_missed';

type UseChatRealtimeOptions = {
  onMessage: (message: ChatMessage) => void;
  onMessageDelivered?: (messageId: string) => void;
  onPeerRead?: (readAt: string) => void;
  onMessageDeleted?: (messageId: string) => void;
  onCallEvent?: (event: ChatCallRealtimeEvent, payload: unknown) => void;
  onReconnect?: () => void;
};

export function useChatRealtime(
  conversationId: string,
  currentUserId: string,
  currentUserName: string,
  options: UseChatRealtimeOptions,
) {
  const {
    onMessage,
    onMessageDelivered,
    onPeerRead,
    onMessageDeleted,
    onCallEvent,
    onReconnect,
  } = options;

  const onMessageRef = React.useRef(onMessage);
  const onMessageDeliveredRef = React.useRef(onMessageDelivered);
  const onPeerReadRef = React.useRef(onPeerRead);
  const onMessageDeletedRef = React.useRef(onMessageDeleted);
  const onCallEventRef = React.useRef(onCallEvent);
  const onReconnectRef = React.useRef(onReconnect);
  onMessageRef.current = onMessage;
  onMessageDeliveredRef.current = onMessageDelivered;
  onPeerReadRef.current = onPeerRead;
  onMessageDeletedRef.current = onMessageDeleted;
  onCallEventRef.current = onCallEvent;
  onReconnectRef.current = onReconnect;

  const [typingName, setTypingName] = React.useState<string | null>(null);
  const typingHideRef = React.useRef<ReturnType<typeof setTimeout>>();
  const lastTypingSentRef = React.useRef(0);
  const channelRef = React.useRef<ReturnType<
    NonNullable<ReturnType<typeof getSupabaseClient>>['channel']
  > | null>(null);

  React.useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !conversationId) {
      return;
    }

    const channel = supabase.channel(`chat:${conversationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        const data = payload as RealtimeChatMessagePayload;
        if (!data?.id || data.senderId === currentUserId) {
          return;
        }

        onMessageRef.current({
          id: data.id,
          sender: 'other',
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt,
          ...(data.messageType ? { messageType: data.messageType } : {}),
          ...(data.call ? { call: data.call } : {}),
          ...(data.replyTo
            ? {
                replyTo: {
                  id: data.replyTo.id,
                  text: data.replyTo.text,
                  senderId: data.replyTo.senderId,
                  sender:
                    data.replyTo.senderId === currentUserId ? 'me' : 'other',
                },
              }
            : {}),
        });

        void channel.send({
          type: 'broadcast',
          event: 'message_delivered',
          payload: { messageId: data.id, userId: currentUserId },
        });
      })
      .on(
        'broadcast',
        { event: 'message_delivered' },
        ({ payload }: { payload: { messageId?: string; userId?: string } }) => {
          if (!payload?.messageId || payload.userId === currentUserId) {
            return;
          }

          onMessageDeliveredRef.current?.(payload.messageId);
        },
      )
      .on(
        'broadcast',
        { event: 'peer_read' },
        ({ payload }: { payload: { userId?: string; readAt?: string } }) => {
          if (
            !payload?.readAt ||
            !payload.userId ||
            payload.userId === currentUserId
          ) {
            return;
          }

          onPeerReadRef.current?.(payload.readAt);
        },
      )
      .on(
        'broadcast',
        { event: 'message_deleted' },
        ({ payload }: { payload: { messageId?: string } }) => {
          if (!payload?.messageId) {
            return;
          }

          onMessageDeletedRef.current?.(payload.messageId);
        },
      )
      .on(
        'broadcast',
        { event: 'typing' },
        ({ payload }: { payload: { userId?: string; name?: string } }) => {
          if (!payload?.userId || payload.userId === currentUserId) {
            return;
          }

          setTypingName(payload.name ?? 'Someone');

          if (typingHideRef.current) {
            clearTimeout(typingHideRef.current);
          }
          typingHideRef.current = setTimeout(() => {
            setTypingName(null);
          }, TYPING_HIDE_MS);
        },
      )
      .on('broadcast', { event: 'call_invite' }, ({ payload }) => {
        onCallEventRef.current?.('call_invite', payload);
      })
      .on('broadcast', { event: 'call_accept' }, ({ payload }) => {
        onCallEventRef.current?.('call_accept', payload);
      })
      .on('broadcast', { event: 'call_decline' }, ({ payload }) => {
        onCallEventRef.current?.('call_decline', payload);
      })
      .on('broadcast', { event: 'call_cancel' }, ({ payload }) => {
        onCallEventRef.current?.('call_cancel', payload);
      })
      .on('broadcast', { event: 'call_end' }, ({ payload }) => {
        onCallEventRef.current?.('call_end', payload);
      })
      .on('broadcast', { event: 'call_missed' }, ({ payload }) => {
        onCallEventRef.current?.('call_missed', payload);
      });

    const unsubscribeResilience = subscribeChannelWithReconnect(channel, {
      onReconnect: () => onReconnectRef.current?.(),
    });

    const unregisterBroadcaster = registerChatBroadcastSender(
      conversationId,
      (event, payload) => {
        void channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      },
    );

    return () => {
      unsubscribeResilience();
      unregisterBroadcaster();
      channelRef.current = null;
      if (typingHideRef.current) {
        clearTimeout(typingHideRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const notifyTyping = React.useCallback(() => {
    const channel = channelRef.current;
    if (!channel || !currentUserName) {
      return;
    }

    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_SEND_INTERVAL_MS) {
      return;
    }

    lastTypingSentRef.current = now;
    void channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, name: currentUserName },
    });
  }, [currentUserId, currentUserName]);

  const ackMessageDelivered = React.useCallback((messageId: string) => {
    const channel = channelRef.current;
    if (!channel) {
      return;
    }

    void channel.send({
      type: 'broadcast',
      event: 'message_delivered',
      payload: { messageId, userId: currentUserId },
    });
  }, [currentUserId]);

  return { typingName, notifyTyping, ackMessageDelivered };
}
