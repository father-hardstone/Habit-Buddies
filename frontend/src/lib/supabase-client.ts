import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ChatCallMessage } from '@/lib/call-constants';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

export function isChatRealtimeEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export type RealtimeChatMessageReplyPayload = {
  id: string;
  text: string;
  senderId: string;
};

export type RealtimeChatMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  messageType?: 'text' | 'call';
  call?: ChatCallMessage;
  replyTo?: RealtimeChatMessageReplyPayload;
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
