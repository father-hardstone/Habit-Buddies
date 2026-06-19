'use client';

import * as React from 'react';

const NEAR_BOTTOM_THRESHOLD = 120;

export function useChatScroll() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const isNearBottomRef = React.useRef(true);
  const [showBackToLatest, setShowBackToLatest] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollHideTimerRef = React.useRef<number>();

  const updateScrollState = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const nearBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;

    isNearBottomRef.current = nearBottom;
    setShowBackToLatest(!nearBottom);
  }, []);

  const handleScroll = React.useCallback(() => {
    updateScrollState();
    setIsScrolling(true);

    if (scrollHideTimerRef.current) {
      window.clearTimeout(scrollHideTimerRef.current);
    }

    scrollHideTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 900);
  }, [updateScrollState]);

  const scrollToLatest = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = scrollRef.current;

    if (container && behavior === 'auto') {
      container.scrollTop = container.scrollHeight;
    } else {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
    }

    isNearBottomRef.current = true;
    setShowBackToLatest(false);
  }, []);

  /** Instant scroll — use after sending or when layout height changes. */
  const scrollToLatestInstant = React.useCallback(() => {
    const run = () => {
      const container = scrollRef.current;
      if (!container) {
        return;
      }

      container.scrollTop = container.scrollHeight;
      isNearBottomRef.current = true;
      setShowBackToLatest(false);
    };

    run();
    requestAnimationFrame(run);
  }, []);

  React.useEffect(() => {
    return () => {
      if (scrollHideTimerRef.current) {
        window.clearTimeout(scrollHideTimerRef.current);
      }
    };
  }, []);

  return {
    scrollRef,
    bottomRef,
    isNearBottomRef,
    showBackToLatest,
    isScrolling,
    handleScroll,
    scrollToLatest,
    scrollToLatestInstant,
    updateScrollState,
  };
}
