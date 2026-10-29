import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PlatformEvent, PlatformEventDocument } from '../schemas/event.schema';

export interface PublishEventDto {
  eventType: string; // e.g. 'review.created', 'lead.created', 'campaign.scheduled'
  idempotencyKey: string; // e.g. 'google_review:rev_10492'
  orgId: string; // User ID / Workspace ID
  locationId?: string;
  payload: Record<string, any>;
}

@Injectable()
export class PlatformEventBusService {
  private readonly logger = new Logger(PlatformEventBusService.name);
  private eventHandlers: Array<(event: PlatformEvent) => Promise<void>> = [];

  constructor(
    @InjectModel(PlatformEvent.name)
    private readonly eventModel: Model<PlatformEventDocument>,
  ) {}

  /**
   * Register a reactive consumer to receive normalized events (used by Orchestrator).
   */
  subscribe(handler: (event: PlatformEvent) => Promise<void>) {
    this.eventHandlers.push(handler);
  }

  /**
   * Publishes an event with strict idempotency check.
   * If the idempotencyKey has already been stored, the duplicate call is safely bypassed.
   */
  async publish(dto: PublishEventDto): Promise<{ event: PlatformEvent; duplicate: boolean }> {
    const existing = await this.eventModel.findOne({ idempotencyKey: dto.idempotencyKey }).exec();
    if (existing) {
      this.logger.debug(
        `[IDEMPOTENT SKIP] Event ${dto.eventType} with key ${dto.idempotencyKey} already recorded.`,
      );
      return { event: existing.toObject(), duplicate: true };
    }

    const eventRecord = new this.eventModel({
      eventId: uuidv4(),
      idempotencyKey: dto.idempotencyKey,
      eventType: dto.eventType,
      orgId: dto.orgId,
      locationId: dto.locationId || 'default',
      payload: dto.payload || {},
      status: 'pending',
    });

    const saved = await eventRecord.save();
    this.logger.log(`[EVENT EMITTED] ${dto.eventType} (ID: ${saved.eventId}, Key: ${dto.idempotencyKey})`);

    // Dispatch asynchronously to all subscribers without blocking the caller
    setImmediate(async () => {
      for (const handler of this.eventHandlers) {
        try {
          await handler(saved.toObject());
        } catch (err: any) {
          this.logger.error(`Handler failed for event ${dto.eventType}: ${err.message}`, err.stack);
        }
      }
    });

    return { event: saved.toObject(), duplicate: false };
  }
}

