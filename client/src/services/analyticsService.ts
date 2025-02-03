type EventName = 'page_view' | 'song_added' | 'song_played' | 'room_created' | 'user_joined';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add failed events to the queue
      this.queue = [...events, ...this.queue];
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  trackEvent(name: EventName, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.queue.push(event);
    this.processQueue();
  }

  trackPageView(path: string) {
    this.trackEvent('page_view', { path });
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 