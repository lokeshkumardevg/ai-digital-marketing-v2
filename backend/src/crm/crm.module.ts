import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { Audience, AudienceSchema } from './schemas/audience.schema';
import { AiModule } from '../ai/ai.module'; // Needed for Orchestrator
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: Audience.name, schema: AudienceSchema },
    ]),
    AiModule,
    AnalyticsModule,
  ],
  providers: [CrmService],
  controllers: [CrmController],
  exports: [CrmService],
})
export class CrmModule {}
