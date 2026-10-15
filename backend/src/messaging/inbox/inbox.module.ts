// src/messaging/inbox/inbox.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../../users/users.module';
import { GoogleBusinessModule } from '../../google-business/google-business.module';
import { WhatsAppService } from '../providers/whatsapp.service';
import { EmailService } from '../providers/email.service';
import { InboxController } from './inbox.controller';
import { InboxWebhookController } from './inbox-webhook.controller';
import { InboxService } from './inbox.service';
import {
  InboxAccount, InboxAccountSchema, InboxConversation, InboxConversationSchema, InboxMessage, InboxMessageSchema,
} from './schemas/inbox.schemas';

// ConfigModule and GatewayModule are global in this app, so ConfigService and AppGateway inject directly.
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InboxAccount.name, schema: InboxAccountSchema },
      { name: InboxConversation.name, schema: InboxConversationSchema },
      { name: InboxMessage.name, schema: InboxMessageSchema },
    ]),
    UsersModule,
    GoogleBusinessModule,
  ],
  controllers: [InboxController, InboxWebhookController],
  // WhatsAppService / EmailService only need ConfigService, so they are provided here again instead of re-exporting MessagingModule.
  providers: [InboxService, WhatsAppService, EmailService],
})
export class InboxModule {}
