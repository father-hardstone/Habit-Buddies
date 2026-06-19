import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';

export type RealtimeMessageReplyPayload = {
  id: string;
  text: string;
  senderId: string;
};

export type RealtimeMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  replyTo?: RealtimeMessageReplyPayload;
};

export type RealtimeMessageDeletedPayload = {
  messageId: string;
};

export type RealtimeChatReadPayload = {
  userId: string;
  readAt: string;
};

export type RealtimeInboxPayload = {
  chatId: string;
  latestMessage: string;
  timestamp: string;
  senderId: string;
};

export type RealtimeInboxPeerReadPayload = {
  chatId: string;
  readAt: string;
};

@Injectable()
export class RealtimeService implements OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private client: SupabaseClient | null = null;
  private readonly channels = new Map<string, Promise<RealtimeChannel>>();

  constructor(private readonly configService: ConfigService) {}

  onModuleDestroy() {
    const supabase = this.client;
    if (!supabase) {
      return;
    }

    for (const channelPromise of this.channels.values()) {
      void channelPromise.then((channel) => {
        void supabase.removeChannel(channel);
      });
    }
    this.channels.clear();
  }

  private getClient(): SupabaseClient | null {
    if (this.client) {
      return this.client;
    }

    const url = this.configService.get<string>('SUPABASE_URL')?.replace(/\/$/, '');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      return null;
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    return this.client;
  }

  private getNamedChannel(channelName: string): Promise<RealtimeChannel | null> {
    const supabase = this.getClient();
    if (!supabase) {
      return Promise.resolve(null);
    }

    const existing = this.channels.get(channelName);
    if (existing) {
      return existing;
    }

    const ready = new Promise<RealtimeChannel>((resolve, reject) => {
      const channel = supabase.channel(channelName);

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          resolve(channel);
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.channels.delete(channelName);
          reject(new Error(`Realtime channel ${channelName} failed (${status})`));
        }
      });
    });

    this.channels.set(channelName, ready);
    return ready;
  }

  private getChatChannel(conversationId: string): Promise<RealtimeChannel | null> {
    return this.getNamedChannel(`chat:${conversationId}`);
  }

  private sendBroadcast(
    channelName: string,
    event: string,
    payload: unknown,
    logLabel: string,
  ): void {
    void this.getNamedChannel(channelName)
      .then((channel) => {
        if (!channel) {
          return;
        }

        return channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      })
      .catch((error: unknown) => {
        this.logger.warn(`${logLabel} failed for ${channelName}: ${String(error)}`);
      });
  }

  broadcastNewMessage(
    conversationId: string,
    message: RealtimeMessagePayload,
  ): void {
    this.sendBroadcast(
      `chat:${conversationId}`,
      'new_message',
      message,
      'Message broadcast',
    );
  }

  broadcastMessageDeleted(
    conversationId: string,
    payload: RealtimeMessageDeletedPayload,
  ): void {
    this.sendBroadcast(
      `chat:${conversationId}`,
      'message_deleted',
      payload,
      'Message deleted broadcast',
    );
  }

  broadcastChatRead(
    conversationId: string,
    payload: RealtimeChatReadPayload,
  ): void {
    this.sendBroadcast(
      `chat:${conversationId}`,
      'peer_read',
      payload,
      'Read receipt broadcast',
    );
  }

  broadcastInboxUpdate(userId: string, payload: RealtimeInboxPayload): void {
    this.sendBroadcast(
      `inbox:${userId}`,
      'inbox_update',
      payload,
      'Inbox update',
    );
  }

  broadcastInboxRead(userId: string, chatId: string): void {
    this.sendBroadcast(
      `inbox:${userId}`,
      'inbox_read',
      { chatId },
      'Inbox read',
    );
  }

  broadcastInboxPeerRead(
    userId: string,
    payload: { chatId: string; readAt: string },
  ): void {
    this.sendBroadcast(
      `inbox:${userId}`,
      'inbox_peer_read',
      payload,
      'Inbox peer read',
    );
  }

  broadcastCallEvent(
    conversationId: string,
    event: string,
    payload: Record<string, unknown>,
  ): void {
    this.sendBroadcast(
      `chat:${conversationId}`,
      event,
      payload,
      `Call event (${event})`,
    );
  }

  broadcastInboxCallEvent(
    userId: string,
    event: string,
    payload: Record<string, unknown>,
  ): void {
    this.sendBroadcast(
      `inbox:${userId}`,
      event,
      payload,
      `Inbox call event (${event})`,
    );
  }
}
