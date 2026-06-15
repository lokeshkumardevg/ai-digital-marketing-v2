import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatbot, ChatbotDocument } from './schemas/chatbot.schema';
import { AiService } from '../ai/ai.service'; // Ensure Orchestrator is wired

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectModel(Chatbot.name) private chatbotModel: Model<ChatbotDocument>,
    @InjectModel('Brand') private brandModel: Model<any>,
    @InjectModel('Campaign') private campaignModel: Model<any>,
    @InjectModel('Review') private reviewModel: Model<any>,
    private readonly aiService: AiService,
  ) {}

  async getAllChatbots(): Promise<Chatbot[]> {
    try {
      const results = await this.chatbotModel.find().lean().exec();
      if (!results || results.length === 0) {
        return [
           { _id: 'bot-1', name: 'Sales Assistant Bot', systemPrompt: 'You are a charming sales agent...', totalConversations: 140, createdAt: new Date() } as any
        ];
      }
      return results as any;
    } catch(e) { return [] as any; }
  }

  async createChatbot(data: Partial<Chatbot>): Promise<Chatbot> {
    const chatbot = new this.chatbotModel(data);
    return await chatbot.save();
  }

  async getChatbotById(id: string): Promise<Chatbot> {
    const chatbot = await this.chatbotModel.findById(id).lean().exec();
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }
    return chatbot as any;
  }

  /**
   * Processes an incoming message for a specific chatbot instance using its custom System Prompt.
   */
  async handleChatMessage(
    chatbotId: string,
    message: string,
    userId?: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<{ reply: string }> {
    if (chatbotId === 'global') {
      this.logger.log(`Routing global platform assistant chat for user: ${userId}`);

      // 1. Gather context
      let brandContext = 'No active brand configuration found.';
      let campaignsContext = 'No campaigns found.';
      let reviewsContext = 'No customer reviews found.';

      if (userId) {
        try {
          // Fetch active brand details
          const brand = await this.brandModel.findOne({ userId }).lean().exec();
          if (brand) {
            brandContext = `
Brand Name: ${brand.name}
Website URL: ${brand.url}
Industry: ${brand.industry || 'Not set'}
Tagline: ${brand.tagline || 'Not set'}
Overall Score: ${brand.overallScore || 'N/A'}
Description: ${brand.brandDetails?.description || 'N/A'}
Business Model: ${brand.brandDetails?.business_model || 'N/A'}
Target Market: ${brand.brandDetails?.target_market || 'N/A'}
Brand Tone: ${Array.isArray(brand.brandDetails?.brand_tone) ? brand.brandDetails.brand_tone.join(', ') : 'N/A'}
Market Keywords: ${Array.isArray(brand.brandDetails?.market_keywords) ? brand.brandDetails.market_keywords.join(', ') : 'N/A'}
`;

            // Fetch reviews for this brand
            const reviews = await this.reviewModel.find({ brandId: brand.id || brand._id }).limit(10).lean().exec();
            if (reviews && reviews.length > 0) {
              reviewsContext = reviews.map(r => 
                `- [${r.platform}] ${r.reviewerName} rated ${r.rating} stars: "${r.content}" (Sentiment: ${r.sentiment}, Status: ${r.status})`
              ).join('\n');
            }
          }

          // Fetch campaigns
          const campaigns = await this.campaignModel.find({ userId }).limit(10).lean().exec();
          if (campaigns && campaigns.length > 0) {
            campaignsContext = campaigns.map(c => {
              const details = c.data || {};
              return `- Campaign Name: "${c.name}"
  Campaign ID: ${c.campaignId}
  Platform: ${c.platform}
  Status: ${c.status}
  Details: Budget $${details.budget || details.dailyBudget || 0}, Objective: ${details.objective || 'N/A'}, Headline: "${details.headline || 'N/A'}", Caption: "${details.caption || 'N/A'}"`;
            }).join('\n\n');
          }
        } catch (e) {
          this.logger.error('Error fetching user context for global chatbot', e);
        }
      }

      // 2. Build system prompt
      const systemPrompt = `You are W-AI, the advanced AI Platform Assistant for AdsGo.ai. 
Your goal is to help the user manage, optimize, and analyze their digital marketing campaigns, brand profiles, and customer reputation.

Here is the current context of the user's project/brand:
---
[BRAND INFORMATION]
${brandContext}

[CAMPAIGNS]
${campaignsContext}

[RECENT REVIEWS]
${reviewsContext}
---

Your Capabilities:
- Provide advanced digital marketing insights.
- Review campaign headlines, budgets, objective alignments and suggest improvements.
- Analyze customer review sentiments, recommend response strategies, or diagnose reputation issues.
- Call out clear discrepancies or possible improvements (e.g., if a campaign has a high budget but a weak/vague headline, or if reviews mention specific recurring complaints like delivery issues).
- Act as a senior marketing strategist, friendly, insightful, concise, and highly professional.

Rules of Interaction:
1. Speak in a helpful, analytical, and professional tone.
2. If asked about campaigns or improvements, refer to the actual campaign list provided in the context. If none exist, suggest how to create one.
3. Be concise and actionable. Use bullet points for recommendations.
4. Answer in the same language as the user (e.g., if the user writes in Hindi/Hinglish, reply in Hindi/Hinglish or friendly English that matches their style).
`;

      // 3. contextualize messages with history
      let contextualizedMessage = message;
      if (history && history.length > 0) {
        const historyStr = history
          .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n');
        contextualizedMessage = `Previous Conversation:\n${historyStr}\n\nUser: ${message}`;
      }

      try {
        const response = await this.aiService.generateContent(contextualizedMessage, systemPrompt);
        return { reply: response };
      } catch (error) {
        this.logger.error('Error handling Global Chatbot response', error);
        return { reply: "I'm having trouble retrieving my strategy guidelines right now. Please try again soon!" };
      }
    }

    const chatbot = await this.chatbotModel.findById(chatbotId);
    if (!chatbot) {
      throw new NotFoundException('Chatbot instance not found');
    }

    this.logger.log(`Routing chat via Chatbot [${chatbot.name}]`);

    // Compile chat history into the prompt structure
    let contextualizedMessage = message;
    if (history && history.length > 0) {
      const historyStr = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
      contextualizedMessage = `Previous Conversation:\n${historyStr}\n\nUser: ${message}`;
    }

    try {
      // Execute the AI generation with the dedicated chatbot persona
      const response = await this.aiService.generateContent(contextualizedMessage, chatbot.systemPrompt);
      
      // Update analytics async
      this.chatbotModel.findByIdAndUpdate(chatbotId, { $inc: { totalConversations: 1 } }).exec().catch();

      return { reply: response };
    } catch (error) {
      this.logger.error('Error handling Chatbot response', error);
      return { reply: "I'm experiencing high traffic right now. Please try again later!" };
    }
  }
}
