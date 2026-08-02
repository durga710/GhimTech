import {
  appendToChain,
  verifyChain,
  type AuditEventInput,
  type ChainedAuditEvent,
} from "@ghimtech/audit";
import type { Store } from "../store/types.js";

/**
 * Appends hash-chained audit events through the store. A single service
 * instance serializes appends so the chain never forks under concurrency.
 */
export class AuditService {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly store: Store) {}

  log(
    event: Omit<AuditEventInput, "occurredAt"> & { occurredAt?: string },
  ): Promise<ChainedAuditEvent> {
    const task = this.queue.then(async () => {
      const previous = await this.store.latestAuditEvent();
      const chained = appendToChain(
        { ...event, occurredAt: event.occurredAt ?? new Date().toISOString() },
        previous,
      );
      await this.store.appendAuditEvent(chained);
      return chained;
    });
    this.queue = task.catch(() => undefined);
    return task;
  }

  async verify(): Promise<{ valid: boolean; brokenAt?: number; length: number }> {
    const events = await this.store.listAuditEvents({ limit: 100_000 });
    const result = verifyChain(events);
    return { ...result, length: events.length };
  }
}
