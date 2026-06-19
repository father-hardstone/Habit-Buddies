import { Check, CheckCheck, Loader2 } from 'lucide-react';
import type { MessageStatus } from '@/lib/database';

export function MessageStatusIcon({
  status,
  className,
}: {
  status?: MessageStatus;
  className?: string;
}) {
  if (status === 'pending') {
    return <Loader2 className={`size-3 animate-spin opacity-70 ${className ?? ''}`} />;
  }

  if (status === 'sent') {
    return <Check className={`size-3.5 shrink-0 opacity-70 ${className ?? ''}`} />;
  }

  if (status === 'read') {
    return (
      <CheckCheck className={`size-3.5 shrink-0 text-[#53bdeb] ${className ?? ''}`} />
    );
  }

  return <CheckCheck className={`size-3.5 shrink-0 opacity-70 ${className ?? ''}`} />;
}

export function clipChatPreview(text: string, maxLength = 72): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  return `${singleLine.slice(0, maxLength)}…`;
}
