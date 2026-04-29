import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly client: Twilio.Twilio;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886');

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured. WhatsApp sending will be mocked.');
      return;
    }
    this.client = Twilio(accountSid, authToken);
    this.logger.log('WhatsApp (Twilio) service initialized');
  }

  async sendMessage(to: string, body: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`[MOCK] WhatsApp to ${to}: ${body}`);
      return;
    }
    const normalizedTo = this.normalizePhone(to);
    try {
      const message = await this.client.messages.create({ from: this.fromNumber, to: normalizedTo, body });
      this.logger.log(`WhatsApp sent to ${normalizedTo} | SID: ${message.sid}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${normalizedTo}: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  private normalizePhone(phone: string): string {
    if (phone.startsWith('whatsapp:')) return phone;
    const digits = phone.replace(/\D/g, '');
    const e164 = digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
    return `whatsapp:${e164}`;
  }
}
