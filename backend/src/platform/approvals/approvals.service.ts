import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Approval, ApprovalDocument } from '../schemas/approval.schema';
import { Run, RunDocument } from '../schemas/run.schema';
import { ActionExecutorService } from '../executors/action-executor.service';
import { AuditService } from '../audit/audit.service';
import { AppGateway } from '../../app.gateway';

export interface CreateApprovalDto {
  runId: string;
  agentId: string;
  coworker: 'max' | 'stella' | 'atlas' | 'echo';
  orgId: string;
  locationId?: string;
  title: string;
  description?: string;
  actionType: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  proposedData: Record<string, any>;
  originalContext?: Record<string, any>;
}

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @InjectModel(Approval.name)
    private readonly approvalModel: Model<ApprovalDocument>,
    @InjectModel(Run.name)
    private readonly runModel: Model<RunDocument>,
    private readonly actionExecutor: ActionExecutorService,
    private readonly auditService: AuditService,
    private readonly gateway: AppGateway,
  ) {}

  async createApproval(dto: CreateApprovalDto): Promise<Approval> {
    const approvalId = uuidv4();
    const item = new this.approvalModel({
      approvalId,
      runId: dto.runId,
      agentId: dto.agentId,
      coworker: dto.coworker,
      orgId: dto.orgId,
      locationId: dto.locationId || 'default',
      title: dto.title,
      description: dto.description || '',
      actionType: dto.actionType,
      priority: dto.priority || 'medium',
      status: 'pending',
      proposedData: dto.proposedData,
      originalContext: dto.originalContext || {},
    });

    const saved = await item.save();

    // Update run status to awaiting_approval
    await this.runModel.findOneAndUpdate(
      { runId: dto.runId },
      { $set: { status: 'awaiting_approval' } },
    );

    // Real-time notification over WebSockets to dashboard
    try {
      this.gateway.sendToUser(dto.orgId, {
        id: `approval_${saved.approvalId}`,
        title: `Draft Awaiting Approval: ${dto.title}`,
        message: `${dto.coworker.toUpperCase()} (${dto.agentId}) proposed an action that requires review.`,
        type: 'warning',
        category: 'approval',
        actionUrl: `/approvals?id=${saved.approvalId}`,
        actionLabel: 'Review in Queue',
        time: new Date().toISOString(),
      });
    } catch {
      // Ignore websocket broadcast errors
    }

    return saved.toObject();
  }

  async getApprovals(
    orgId: string,
    query: {
      status?: 'pending' | 'approved' | 'rejected' | 'all';
      coworker?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const filter: any = { orgId };
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    } else if (!query.status) {
      filter.status = 'pending';
    }
    if (query.coworker && query.coworker !== 'all') {
      filter.coworker = query.coworker.toLowerCase();
    }

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [items, total, pendingCount] = await Promise.all([
      this.approvalModel.find(filter).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.approvalModel.countDocuments(filter),
      this.approvalModel.countDocuments({ orgId, status: 'pending' }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pendingCount,
    };
  }

  async getPendingCount(orgId: string): Promise<number> {
    return this.approvalModel.countDocuments({ orgId, status: 'pending' });
  }

  async getApprovalById(approvalId: string, orgId?: string): Promise<Approval> {
    const filter: any = { approvalId };
    if (orgId) filter.orgId = orgId;
    const approval = await this.approvalModel.findOne(filter).lean().exec();
    if (!approval) throw new NotFoundException('Approval request not found');
    return approval as any;
  }

  async approve(
    approvalId: string,
    user: { id: string; email: string },
    body?: { editedData?: Record<string, any>; notes?: string },
  ) {
    const approval = await this.approvalModel.findOne({ approvalId, orgId: user.id });
    if (!approval) throw new NotFoundException('Approval request not found');
    if (approval.status !== 'pending') {
      throw new BadRequestException(`Approval is already in '${approval.status}' state`);
    }

    const finalPayload = body?.editedData || approval.proposedData;

    // 1. Execute the outward action idempotently
    const executionResult = await this.actionExecutor.execute({
      actionType: approval.actionType,
      runId: approval.runId,
      agentId: approval.agentId,
      orgId: approval.orgId,
      locationId: approval.locationId,
      payload: finalPayload,
      actor: { type: 'user', id: user.id, name: user.email },
    });

    if (!executionResult.success) {
      throw new BadRequestException(`Action execution failed: ${executionResult.error}`);
    }

    // 2. Update Approval state
    approval.status = 'approved';
    approval.reviewedBy = user.email;
    approval.reviewedAt = new Date();
    if (body?.editedData) approval.editedData = body.editedData;
    await approval.save();

    // 3. Update Run state
    await this.runModel.findOneAndUpdate(
      { runId: approval.runId },
      {
        $set: {
          status: 'executed',
          completedAt: new Date(),
          executedAction: finalPayload,
          result: executionResult.result,
          approver: {
            userId: user.id,
            userEmail: user.email,
            action: 'approved',
            decidedAt: new Date(),
            notes: body?.notes,
          },
        },
      },
    );

    // 4. Audit Log
    await this.auditService.log({
      orgId: user.id,
      runId: approval.runId,
      agentId: approval.agentId,
      action: 'approval.approved',
      actor: { type: 'user', id: user.id, name: user.email },
      details: { approvalId, actionType: approval.actionType, notes: body?.notes },
    });

    return {
      success: true,
      approvalId,
      status: 'approved',
      result: executionResult.result,
    };
  }

  async reject(
    approvalId: string,
    user: { id: string; email: string },
    body: { reason: string },
  ) {
    const approval = await this.approvalModel.findOne({ approvalId, orgId: user.id });
    if (!approval) throw new NotFoundException('Approval request not found');
    if (approval.status !== 'pending') {
      throw new BadRequestException(`Approval is already in '${approval.status}' state`);
    }

    approval.status = 'rejected';
    approval.rejectionReason = body.reason || 'Rejected by reviewer';
    approval.reviewedBy = user.email;
    approval.reviewedAt = new Date();
    await approval.save();

    await this.runModel.findOneAndUpdate(
      { runId: approval.runId },
      {
        $set: {
          status: 'rejected',
          completedAt: new Date(),
          approver: {
            userId: user.id,
            userEmail: user.email,
            action: 'rejected',
            decidedAt: new Date(),
            notes: body.reason,
          },
        },
      },
    );

    await this.auditService.log({
      orgId: user.id,
      runId: approval.runId,
      agentId: approval.agentId,
      action: 'approval.rejected',
      actor: { type: 'user', id: user.id, name: user.email },
      details: { approvalId, reason: body.reason },
    });

    return {
      success: true,
      approvalId,
      status: 'rejected',
      reason: body.reason,
    };
  }
}

