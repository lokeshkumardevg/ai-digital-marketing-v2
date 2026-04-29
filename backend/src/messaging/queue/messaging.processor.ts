import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { WhatsAppService } from '../providers/whatsapp.service';
import { EmailService } from '../providers/email.service';
import { MessageLogService } from '../message-log.service';

export interface MessageJob {
  type: 'whatsapp' | 'email' | 'both';
  user: { name: string; phone?: string; email?: string; };
  message: string;
  logId?: string;
  recipientIndex?: number;
}

@Processor('messages')
export class MessagingProcessor {
  private readonly logger = new Logger(MessagingProcessor.name);

  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly emailService: EmailService,
    private readonly messageLogService: MessageLogService,
  ) {}

  @Process()
  async handleMessageJob(job: Job<MessageJob>): Promise<void> {
    const { type, user, message, logId, recipientIndex } = job.data;
    this.logger.log(`Processing job #${job.id} | type=${type} | user=${user.name}`);

    const results: { channel: string; success: boolean; error?: string }[] = [];

    if (type === 'whatsapp' || type === 'both') {
      if (user.phone) {
        const result = await this.sendWhatsApp(user.phone, message, user.name);
        results.push({ channel: 'whatsapp', ...result });
      } else {
        this.logger.warn(`Skipping WhatsApp for ${user.name}: no phone`);
      }
    }
    if (type === 'email' || type === 'both') {
      if (user.email) {
        const result = await this.sendEmail(user.email, message, user.name);
        results.push({ channel: 'email', ...result });
      } else {
        this.logger.warn(`Skipping email for ${user.name}: no email`);
      }
    }

    // Update log if tracking is enabled
    if (logId && typeof recipientIndex === 'number') {
      const attempted = results.length > 0;
      const allSuccess = attempted && results.every(r => r.success);
      const anyFailed = attempted && results.some(r => !r.success);
      const isSuccess = attempted && allSuccess;
      const errorMessage = anyFailed
        ? results.filter(r => !r.success).map(r => `${r.channel}: ${r.error}`).join('; ')
        : undefined;

      await this.messageLogService.updateRecipientStatus(logId, recipientIndex, isSuccess, errorMessage);
    }

    this.logger.log(`Completed job #${job.id} for user=${user.name}`);
  }

  private async sendWhatsApp(phone: string, message: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.whatsAppService.sendMessage(phone, message);
      return { success: true };
    } catch (error) {
      const errMsg = (error as any)?.message || String(error);
      this.logger.error(`WhatsApp failed for ${name} (${phone}): ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }

  private async sendEmail(email: string, message: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Message from AI Digital Marketing';
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#4F46E5;">Hello, ${name}!</h2>
          <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;">
            <p style="color:#374151;line-height:1.6;margin:0;">${message}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;">Sent via AI Digital Marketing Platform.</p>
        </div>`;
      await this.emailService.sendEmail(email, subject, html);
      return { success: true };
    } catch (error) {
      const errMsg = (error as any)?.message || String(error);
      this.logger.error(`Email failed for ${name} (${email}): ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }
}
