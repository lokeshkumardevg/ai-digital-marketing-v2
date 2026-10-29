import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

export interface RecordAuditDto {
  orgId: string;
  locationId?: string;
  runId?: string;
  agentId?: string;
  action: string;
  actor: {
    type: 'agent' | 'user' | 'system';
    id: string;
    name?: string;
  };
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(dto: RecordAuditDto): Promise<AuditLog> {
    const entry = new this.auditLogModel({
      logId: uuidv4(),
      orgId: dto.orgId,
      locationId: dto.locationId || 'default',
      runId: dto.runId,
      agentId: dto.agentId,
      action: dto.action,
      actor: dto.actor,
      details: dto.details || {},
    });

    const saved = await entry.save();
    this.logger.debug(`[AUDIT] ${dto.action} by ${dto.actor.type}:${dto.actor.id}`);
    return saved.toObject();
  }

  async getLogs(orgId: string, query: { agentId?: string; runId?: string; limit?: number; skip?: number }) {
    const filter: any = { orgId };
    if (query.agentId) filter.agentId = query.agentId;
    if (query.runId) filter.runId = query.runId;

    const limit = Math.min(query.limit || 50, 100);
    const skip = query.skip || 0;

    const [logs, total] = await Promise.all([
      this.auditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return { logs, total, limit, skip };
  }
}

