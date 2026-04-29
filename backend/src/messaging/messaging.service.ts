import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import * as XLSX from 'xlsx';
import { CreateCampaignDto, UserDto } from './dto/create-campaign.dto';
import { MessageJob } from './queue/messaging.processor';
import { MessageLogService } from './message-log.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectQueue('messages') private readonly messageQueue: Queue<MessageJob>,
    private readonly messageLogService: MessageLogService,
  ) {}

  processFile(file: Express.Multer.File): UserDto[] {
    if (!file) throw new BadRequestException('No file provided');
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows || rows.length === 0) throw new BadRequestException('File is empty or has no data rows');

      const users: UserDto[] = rows.map((row, index) => {
        const normalize = (key: string) => {
          const match = Object.keys(row).find(k => k.toLowerCase().trim() === key);
          return match ? String(row[match]).trim() : '';
        };
        return {
          name: normalize('name') || `User ${index + 1}`,
          phone: normalize('phone'),
          email: normalize('email'),
        };
      });

      this.logger.log(`Parsed ${users.length} users from uploaded file`);
      return users;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
throw new BadRequestException(`Failed to parse file: ${(error as any)?.message || String(error)}`);
    }
  }

  async sendCampaign(dto: CreateCampaignDto): Promise<{ queued: number; skipped: number; jobIds: (number | string)[]; }> {
    const { type, message, users } = dto;
    if (!users || users.length === 0) throw new BadRequestException('No users provided');

    // Create a persistent log entry before queueing jobs
    const log = await this.messageLogService.createLog(message, type, users);
    const logId = log._id.toString();

    let queued = 0, skipped = 0;
    const jobIds: (number | string)[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const personalizedMessage = this.replaceVars(message, user);
      if (type === 'whatsapp' && !user.phone) { skipped++; continue; }
      if (type === 'email' && !user.email) { skipped++; continue; }

      const job = await this.messageQueue.add(
        { type, user, message: personalizedMessage, logId, recipientIndex: i },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 50 },
      );
      jobIds.push(job.id);
      queued++;
    }

    this.logger.log(`Campaign dispatched: ${queued} queued, ${skipped} skipped (logId: ${logId})`);
    return { queued, skipped, jobIds };
  }

  replaceVars(message: string, user: UserDto): string {
    return message
      .replace(/\{\{name\}\}/gi, user.name ?? '')
      .replace(/\{\{phone\}\}/gi, user.phone ?? '')
      .replace(/\{\{email\}\}/gi, user.email ?? '');
  }
}
