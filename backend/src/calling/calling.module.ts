import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallingController } from './calling.controller';
import { CallingService } from './calling.service';
import { CallCampaign, CallCampaignSchema } from './schemas/call-campaign.schema';
import { CallRecord, CallRecordSchema } from './schemas/call-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CallCampaign.name, schema: CallCampaignSchema },
      { name: CallRecord.name, schema: CallRecordSchema },
    ]),
  ],
  controllers: [CallingController],
  providers: [CallingService],
  exports: [CallingService],
})
export class CallingModule {}
