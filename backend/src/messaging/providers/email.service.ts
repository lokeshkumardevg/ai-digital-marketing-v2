import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('EMAIL_USERNAME');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');
    this.fromAddress = user ?? 'noreply@example.com';

    if (!user || !pass) {
      this.logger.warn('Email credentials not configured. Email sending will be mocked.');
      return;
    }
this.transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    this.logger.log('Email (Nodemailer/Gmail) service initialized');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[MOCK] Email to ${to} | Subject: ${subject}`);
      return;
    }
    try {
      const info = await this.transporter.sendMail({
        from: `"AI Digital Marketing" <${this.fromAddress}>`,
        to, subject, html,
      });
      this.logger.log(`Email sent to ${to} | MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message}`, error?.stack);
      throw error;
    }
  }
}
