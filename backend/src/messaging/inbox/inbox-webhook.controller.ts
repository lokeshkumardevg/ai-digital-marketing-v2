// src/messaging/inbox/inbox-webhook.controller.ts
// Public endpoints called by Meta and Twilio. They are NOT behind the JWT guard, so every request is
// authenticated by its signature instead (Meta: X-Hub-Signature-256, Twilio: X-Twilio-Signature).
import {
  Body, Controller, ForbiddenException, Get, Headers, HttpCode, Logger, Post, Query, Req, Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InboxService } from './inbox.service';

@Controller('messaging/inbox/webhooks')
export class InboxWebhookController {
  private readonly logger = new Logger(InboxWebhookController.name);

  constructor(private readonly inbox: InboxService, private readonly config: ConfigService) {}

  /** Meta calls this once when you save the webhook in the App Dashboard */
  @Get('meta')
  verifyMeta(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string, @Res() res: any) {
    const expected = this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && expected && token === expected) return res.status(200).send(challenge);
    return res.status(403).send('Forbidden');
  }

  @Post('meta')
  @HttpCode(200)
  async receiveMeta(@Req() req: any, @Headers('x-hub-signature-256') signature: string, @Body() body: any) {
    const secret = this.config.get<string>('META_APP_SECRET');
    const raw: Buffer | undefined = req.rawBody;
    if (!secret || !raw) {
      this.logger.error('Meta webhook rejected: META_APP_SECRET or raw body missing (see main.ts patch).');
      throw new ForbiddenException();
    }
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const a = Buffer.from(signature || '');
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new ForbiddenException();

    try { await this.inbox.handleMetaWebhook(body); }
    catch (e: any) { this.logger.error(`Meta webhook processing failed: ${e?.message}`, e?.stack); }
    return 'EVENT_RECEIVED'; // always 200 once the signature is valid, otherwise Meta keeps retrying
  }

  /** Twilio "when a message comes in" URL for the WhatsApp number */
  @Post('twilio')
  @HttpCode(200)
  async receiveTwilio(@Headers('x-twilio-signature') signature: string, @Body() body: Record<string, string>, @Res() res: any) {
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const base = (this.config.get<string>('BACKEND_URL') || '').replace(/\/$/, '');
    if (!authToken || !base) {
      this.logger.error('Twilio webhook rejected: TWILIO_AUTH_TOKEN or BACKEND_URL missing.');
      throw new ForbiddenException();
    }
    // Twilio signs: full URL + all POST params sorted by key, HMAC-SHA1 with the auth token
    const url = `${base}/messaging/inbox/webhooks/twilio`;
    const data = Object.keys(body || {}).sort().reduce((acc, k) => acc + k + body[k], url);
    const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
    const a = Buffer.from(signature || '');
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new ForbiddenException();

    try { await this.inbox.handleTwilioInbound(body); }
    catch (e: any) { this.logger.error(`Twilio webhook processing failed: ${e?.message}`, e?.stack); }
    return res.status(200).type('text/xml').send('<Response></Response>');
  }
}
