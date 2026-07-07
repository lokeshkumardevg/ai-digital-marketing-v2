import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog, SystemLogDocument } from './schemas/log.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(SystemLog.name)
    private readonly logModel: Model<SystemLogDocument>,
  ) {}

  async createLog(level: string, message: string, context?: string, meta?: any) {
    // Only store specific levels to save DB space if desired, but we'll save all for now
    try {
      await this.logModel.create({
        level,
        message,
        context,
        meta,
      });
    } catch (e) {
      // Silently fail to prevent recursive logging loops
    }
  }

  async getLogs(query: {
    startDate?: string;
    endDate?: string;
    level?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const { startDate, endDate, level, category, page = 1, limit = 50 } = query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (level && level !== 'all') {
      filter.level = level;
    }

    if (category && category !== 'all') {
      // Regex match for context/category
      filter.context = { $regex: category, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.logModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)).exec(),
      this.logModel.countDocuments(filter),
    ]);

    return {
      data: logs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategories() {
    return this.logModel.distinct('context').exec();
  }
}
