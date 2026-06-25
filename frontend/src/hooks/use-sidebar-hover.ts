'use client';

import * as React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const HOVER_OPEN_DELAY_MS = 160;
const HOVER_CLOSE_DELAY_MS = 320;

export function useSidebarHover() {
  const { isMobile, setOpen } = useSidebar();
  const openTimerRef = React.useRef<number>();
  const closeTimerRef = React.useRef<number>();

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = undefined;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  React.useEffect(() => {
    clearTimers();

    if (isMobile) {
      return;
    }

    setOpen(false);
    // Collapse when entering desktop; defaultOpen handles initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  React.useEffect(() => clearTimers, [clearTimers]);

  const handleMouseEnter = React.useCallback(() => {
    if (isMobile) {
      return;
    }

    clearTimers();
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, HOVER_OPEN_DELAY_MS);
  }, [clearTimers, isMobile, setOpen]);

  const handleMouseLeave = React.useCallback(() => {
    if (isMobile) {
      return;
    }

    clearTimers();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearTimers, isMobile, setOpen]);

  return {
    handleMouseEnter,
    handleMouseLeave,
  };
}
