/**
 * Client-side analytics event tracking
 * Tracks user interactions and sends to metrics endpoint
 */

export interface ClientEvent {
  type:
    | 'page_view'
    | 'generation_start'
    | 'generation_success'
    | 'generation_error'
    | 'history_delete'
    | 'history_favorite'
    | 'history_view'
    | 'login'
    | 'register'
    | 'logout'
    | 'form_submit';
  timestamp: Date;
  duration?: number; // ms, for timed events
  metadata?: Record<string, any>;
}

// In-memory event buffer
const eventBuffer: ClientEvent[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Record a user event
 */
export function trackEvent(event: Omit<ClientEvent, 'timestamp'>): void {
  eventBuffer.push({
    ...event,
    timestamp: new Date(),
  });

  // Auto-flush when buffer gets large
  if (eventBuffer.length >= MAX_BUFFER_SIZE) {
    flushEvents();
  }
}

/**
 * Track page views
 */
export function trackPageView(pageName: string): void {
  trackEvent({
    type: 'page_view',
    metadata: { page: pageName },
  });
}

/**
 * Track generation request start
 */
export function trackGenerationStart(params: {
  framework: string;
  style: string;
  theme: string;
}): void {
  trackEvent({
    type: 'generation_start',
    metadata: params,
  });
}

/**
 * Track successful generation
 */
export function trackGenerationSuccess(params: {
  framework: string;
  style: string;
  theme: string;
  tokensUsed: number;
  duration: number;
}): void {
  trackEvent({
    type: 'generation_success',
    duration: params.duration,
    metadata: {
      framework: params.framework,
      style: params.style,
      theme: params.theme,
      tokensUsed: params.tokensUsed,
    },
  });
}

/**
 * Track generation error
 */
export function trackGenerationError(errorMessage: string, duration: number): void {
  trackEvent({
    type: 'generation_error',
    duration,
    metadata: { error: errorMessage },
  });
}

/**
 * Track history deletion
 */
export function trackHistoryDelete(historyId: string): void {
  trackEvent({
    type: 'history_delete',
    metadata: { historyId },
  });
}

/**
 * Track favorite toggle
 */
export function trackHistoryFavorite(historyId: string, isFavorite: boolean): void {
  trackEvent({
    type: 'history_favorite',
    metadata: { historyId, isFavorite },
  });
}

/**
 * Track history view/open
 */
export function trackHistoryView(historyId: string): void {
  trackEvent({
    type: 'history_view',
    metadata: { historyId },
  });
}

/**
 * Track login event
 */
export function trackLogin(): void {
  trackEvent({
    type: 'login',
  });
}

/**
 * Track registration
 */
export function trackRegister(): void {
  trackEvent({
    type: 'register',
  });
}

/**
 * Track logout
 */
export function trackLogout(): void {
  trackEvent({
    type: 'logout',
  });
}

/**
 * Send buffered events to server
 */
export async function flushEvents(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const eventsToSend = [...eventBuffer];
  eventBuffer.length = 0; // Clear buffer

  try {
    // Send to analytics endpoint (to be implemented on backend)
    // For now, log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Flushing events:', eventsToSend);
    }

    // TODO: When backend analytics endpoint is ready:
    // await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events: eventsToSend }),
    // });
  } catch (error) {
    console.error('Failed to flush events:', error);
    // Re-add to buffer for retry
    eventBuffer.push(...eventsToSend);
  }
}

/**
 * Periodically flush events (every 30 seconds)
 */
export function startAutoFlush(intervalMs = 30000): () => void {
  const interval = setInterval(() => {
    flushEvents();
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Flush events on page unload
 */
export function setupPageUnloadTracking(): void {
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });
}
