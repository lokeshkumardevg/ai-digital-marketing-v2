import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageLog, MessageLogDocument } from './schemas/message-log.schema';
import { UserDto } from './dto/create-campaign.dto';

@Injectable()
export class MessageLogService {
  private readonly logger = new Logger(MessageLogService.name);

  constructor(
    @InjectModel(MessageLog.name) private readonly messageLogModel: Model<MessageLogDocument>,
  ) {}

  async createLog(
    messageContent: string,
    channel: string,
    users: UserDto[],
  ): Promise<MessageLogDocument> {
    const audienceList = users.map((u) => ({
      name: u.name,
      phone: u.phone || undefined,
      email: u.email || undefined,
      status: 'pending' as const,
    }));

    const log = new this.messageLogModel({
      messageContent,
      channel,
      audienceList,
      totalRecipients: users.length,
      successCount: 0,
      failedCount: 0,
      processedCount: 0,
      status: 'pending',
    });

    const saved = await log.save();
    this.logger.log(`Created message log ${saved._id} for ${users.length} recipients`);
    return saved;
  }

  async updateRecipientStatus(
    logId: string,
    recipientIndex: number,
    isSuccess: boolean,
    errorMessage?: string,
  ): Promise<void> {
    const status = isSuccess ? 'success' : 'failed';

    const result = await this.messageLogModel.updateOne(
      {
        _id: logId,
        [`audienceList.${recipientIndex}.status`]: 'pending',
      },
      {
        $set: {
          [`audienceList.${recipientIndex}.status`]: status,
          [`audienceList.${recipientIndex}.errorMessage`]: errorMessage || null,
        },
        $inc: {
          successCount: isSuccess ? 1 : 0,
          failedCount: isSuccess ? 0 : 1,
          processedCount: 1,
        },
      },
    );

    if (result.modifiedCount === 0) {
      this.logger.warn(`Log ${logId} recipient ${recipientIndex} already processed or not found`);
      return;
    }

    this.logger.log(`Updated log ${logId} recipient ${recipientIndex} → ${status}`);

    // Finalize status if all recipients processed
    const log = await this.messageLogModel.findById(logId).lean();
    if (log && log.processedCount >= log.totalRecipients && log.status === 'pending') {
      const finalStatus = log.failedCount === 0 ? 'success' : log.successCount === 0 ? 'failed' : 'partial';
      await this.messageLogModel.updateOne({ _id: logId }, { $set: { status: finalStatus } });
      this.logger.log(`Finalized log ${logId} status → ${finalStatus}`);
    }
  }

  async findLogs(filter?: '5days' | '15days' | '30days'): Promise<MessageLogDocument[]> {
    const query: Record<string, any> = {};

    if (filter) {
      const days = parseInt(filter.replace('days', ''), 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      query.createdAt = { $gte: cutoff };
    }

    return this.messageLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async deleteOldLogs(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const result = await this.messageLogModel.deleteMany({
      createdAt: { $lt: cutoff },
    });

    this.logger.log(`Deleted ${result.deletedCount} message logs older than 30 days`);
    return result.deletedCount || 0;
  }
}

