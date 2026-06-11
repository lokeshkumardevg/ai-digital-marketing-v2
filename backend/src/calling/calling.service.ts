import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CallCampaign, CallCampaignDocument } from './schemas/call-campaign.schema';
import { CallRecord, CallRecordDocument } from './schemas/call-record.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import axios from 'axios';

@Injectable()
export class CallingService {
  private readonly logger = new Logger(CallingService.name);
  
  // E.g., Bland.ai or Vapi API Key. If not provided, it will mock the calls.
  private readonly voiceApiKey = process.env.VOICE_AI_API_KEY || 'mock_key'; 

  constructor(
    @InjectModel(CallCampaign.name) private campaignModel: Model<CallCampaignDocument>,
    @InjectModel(CallRecord.name) private recordModel: Model<CallRecordDocument>,
  ) {}

  async createCampaign(dto: CreateCampaignDto): Promise<CallCampaign> {
    const campaign = new this.campaignModel({
      name: dto.name,
      prompt: dto.prompt,
      totalContacts: dto.contacts.length,
      status: 'Running',
    });
    const savedCampaign = await campaign.save();

    // Fire off the calls asynchronously
    this.initiateBulkCalls(savedCampaign._id.toString(), dto);

    return savedCampaign;
  }

  private async initiateBulkCalls(campaignId: string, dto: CreateCampaignDto) {
    this.logger.log(`Initiating ${dto.contacts.length} calls for campaign ${campaignId}`);

    for (const contact of dto.contacts) {
      // Create initial DB record for the call
      const record = new this.recordModel({
        campaignId: campaignId,
        customerName: contact.name,
        customerPhone: contact.phone,
        status: 'Initiated',
      });
      await record.save();

      // Trigger the actual call (mocked or real API)
      await this.triggerVoiceApiCall(record._id.toString(), contact.phone, contact.name, dto.prompt);
    }
  }

  private async triggerVoiceApiCall(recordId: string, phone: string, name: string, prompt: string) {
    try {
      if (this.voiceApiKey === 'mock_key') {
        // Simulate a real API call if no key is provided
        this.logger.debug(`[MOCK] Calling ${name} at ${phone}`);
        // In a mock scenario, we just update the status to "In Progress"
        await this.recordModel.findByIdAndUpdate(recordId, { status: 'In Progress', callId: `mock_call_${Date.now()}` });
        
        // Simulate a webhook firing back 5 seconds later
        setTimeout(async () => {
          await this.handleWebhook({
            callId: `mock_call_${Date.now()}`,
            recordId: recordId,
            status: 'Completed',
            duration: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
            recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample audio
            transcript: `AI: Hello, am I speaking with ${name}?\n${name}: Yes, this is ${name}.\nAI: Great! I'm calling about our new promotion...`,
            summary: `${name} was interested in the promotion and agreed to receive an email.`
          });
        }, 5000);
      } else {
        // Example implementation for Bland.ai
        // const response = await axios.post('https://api.bland.ai/v1/calls', {
        //   phone_number: phone,
        //   task: prompt,
        //   webhook: `${process.env.VITE_API_URL || 'http://localhost:3000'}/calling/webhook`,
        //   metadata: { recordId }
        // }, { headers: { authorization: this.voiceApiKey } });
        
        // await this.recordModel.findByIdAndUpdate(recordId, { callId: response.data.call_id });
      }
    } catch (error) {
      this.logger.error(`Failed to call ${phone}`, error);
      await this.recordModel.findByIdAndUpdate(recordId, { status: 'Failed' });
    }
  }

  async handleWebhook(data: any) {
    this.logger.log(`Received webhook for call ${data.callId || data.recordId}`);
    
    // Find the record by callId or recordId (passed in metadata)
    const filter = data.recordId ? { _id: data.recordId } : { callId: data.callId };
    
    const update = {
      status: data.status || 'Completed',
      duration: data.duration || 0,
      recordingUrl: data.recordingUrl || data.recording_url,
      transcript: data.transcript || data.transcripts?.map((t: any) => `${t.user}: ${t.text}`).join('\n'),
      summary: data.summary,
    };

    const record = await this.recordModel.findOneAndUpdate(filter, update, { new: true });
    
    if (record) {
      // Update campaign progress
      const campaign = await this.campaignModel.findById(record.campaignId);
      if (campaign) {
        campaign.completedCalls += 1;
        if (campaign.completedCalls >= campaign.totalContacts) {
          campaign.status = 'Completed';
        }
        await campaign.save();
      }
    }
  }

  async getCampaigns() {
    return this.campaignModel.find().sort({ createdAt: -1 }).exec();
  }

  async getCampaignRecords(campaignId: string) {
    return this.recordModel.find({ campaignId: campaignId as any }).sort({ createdAt: -1 }).exec();
  }
}
