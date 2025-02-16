type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: EventHandler[] } = {};

  on(event: string, handler: EventHandler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off(event: string, handler: EventHandler) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => handler(...args));
  }
}

export const eventEmitter = new EventEmitter();

export const AUTH_EVENTS = {
  REQUIRE_LOGIN: 'auth:requireLogin'
};

export const MAP_EVENTS = {
  SUBSCRIPTION_UPDATED: 'map:subscription-updated',
  NODE_COMPLETED: 'map:node-completed'
} as const;

export interface SubscriptionUpdatedEvent {
  mapId: number;
  isSubscribed: boolean;
  subscriberCount: number;
}

export interface NodeCompletedEvent {
  mapId: number;
  nodeId: number;
  name?: string;
  completedAt: string;
  mapPlayTitle?: string;
  mapPlayMemberId: number;
}

type MapEvents = {
  [MAP_EVENTS.SUBSCRIPTION_UPDATED]: SubscriptionUpdatedEvent;
  [MAP_EVENTS.NODE_COMPLETED]: NodeCompletedEvent;
}; 