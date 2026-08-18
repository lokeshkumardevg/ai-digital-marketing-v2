import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
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
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getAllChatbots(userId?: string): Promise<Chatbot[]> {
    try {
      const filter = userId ? { userId } : {};
      const results = await this.chatbotModel.find(filter).lean().exec();
      return results as any;
    } catch (error) {
      return [
         { _id: 'bot-1', name: 'Sales Assistant Bot', systemPrompt: 'You are a charming sales agent...', totalConversations: 140, createdAt: new Date() } as any
      ];
    }
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
      let userContext = 'User profile details not found.';
      let walletContext = 'No wallet configuration found.';
      let txnsContext = 'No recent wallet transactions found.';
      let contactsContext = 'No CRM contacts found.';
      let workflowsContext = 'No active automation workflows found.';
      let linkedinContext = 'No LinkedIn CRM integration data found.';
      let socialPostsContext = 'No social media scheduler posts found.';

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

          // ── DYNAMIC EXTENDED CONTEXT ──
          // A. User Details
          const userM = this.getModelSafely('User');
          if (userM) {
            const user = await userM.findById(userId).lean().exec();
            if (user) {
              userContext = `User ID: ${user._id || user.id}
User Name: ${user.name || 'N/A'}
Email: ${user.email}
Country: ${user.country || 'India'}
Currency: ${user.currency || 'INR'}
Role: ${user.role || 'client'}
Subscription Plan: ${user.subscriptionTier || 'free'}
OAuth Connections: [Google Ads: ${!!user.googleRefreshToken}, Meta Ads: ${!!user.metaAccessToken}, LinkedIn Ads: ${!!user.linkedinAccessToken}, Twitter Ads: ${!!user.twitterAccessToken}]`;
            }
          }

          // B. Wallet Details
          const walletM = this.getModelSafely('Wallet');
          if (walletM) {
            const wallet = await walletM.findOne({ userId }).lean().exec();
            if (wallet) {
              walletContext = `Wallet Status: Connected
Current Balance: ${wallet.balance || 0}`;
            }
          }

          // C. Recent Transactions
          const txnM = this.getModelSafely('Transaction');
          if (txnM) {
            const txns = await txnM.find({ userId }).sort({ createdAt: -1 }).limit(5).lean().exec();
            if (txns && txns.length > 0) {
              txnsContext = txns.map(t => 
                `- Type: ${t.type}, Amount: ${t.amount}, Currency: ${t.currency || 'INR'}, Status: ${t.status || 'SUCCESS'}, Date: ${t.createdAt || t.date || 'N/A'}`
              ).join('\n');
            }
          }

          // D. CRM Contacts
          const contactM = this.getModelSafely('Contact');
          if (contactM) {
            const contacts = await contactM.find({ userId }).limit(10).lean().exec();
            if (contacts && contacts.length > 0) {
              contactsContext = contacts.map(c => 
                `- Contact Name: "${c.name || 'N/A'}", Email: ${c.email}, Phone: "${c.phone || 'N/A'}", Source: ${c.source || 'Manual'}, Stage: ${c.lifecycleStage || 'Lead'}, Created At: ${c.createdAt || 'N/A'}`
              ).join('\n');
            }
          }

          // E. Automation Workflows
          const workflowM = this.getModelSafely('Workflow');
          if (workflowM) {
            const workflows = await workflowM.find({ userId }).limit(5).lean().exec();
            if (workflows && workflows.length > 0) {
              workflowsContext = workflows.map(w => 
                `- Workflow Name: "${w.name}", Trigger: "${w.triggerType}", Active: ${w.isActive}, Action Steps: ${w.steps?.length || 0}`
              ).join('\n');
            }
          }

          // F. LinkedIn Leads
          const liLeadM = this.getModelSafely('LinkedInLead');
          if (liLeadM) {
            const leads = await liLeadM.find({ userId }).limit(10).lean().exec();
            if (leads && leads.length > 0) {
              linkedinContext = leads.map(l => 
                `- Lead Name: "${l.name || 'N/A'}", Title: "${l.title || 'N/A'}", Company: "${l.company || 'N/A'}", Status: ${l.connectedStatus || 'N/A'}, Stage: ${l.stage || 'N/A'}`
              ).join('\n');
            }
          }

          // G. Social Posts Scheduler
          const socialPostM = this.getModelSafely('SocialPost');
          if (socialPostM) {
            const posts = await socialPostM.find({ userId }).limit(5).lean().exec();
            if (posts && posts.length > 0) {
              socialPostsContext = posts.map(p => 
                `- Platform: ${p.platform}, Status: ${p.status}, Caption snippet: "${p.content?.slice(0, 50)}...", Scheduled Date: ${p.scheduledAt || 'N/A'}`
              ).join('\n');
            }
          }

        } catch (e) {
          this.logger.error('Error fetching user context for global chatbot', e);
        }
      }

      // 2. Invoke the Python AI Agent at port 8003
      try {
        const agentServerUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8003';
        const response = await fetch(`${agentServerUrl}/api/v1/dashboard-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: message,
            history,
            userContext,
            walletContext,
            txnsContext,
            brandContext,
            campaignsContext,
            reviewsContext,
            contactsContext,
            workflowsContext,
            linkedinContext,
            socialPostsContext,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json && json.reply) {
            this.logger.log('Generated dashboard chatbot response using Python Agent Server');
            return { reply: json.reply };
          }
        } else {
          const errText = await response.text();
          this.logger.warn(`Python Agent dashboard-agent failed: ${response.status} - ${errText}`);
        }
      } catch (error) {
        this.logger.error('Error calling Python dashboard-agent, falling back to local OpenAI', error);
      }

      // 3. Fallback to local NestJS AI generation if Python Agent is down
      const fallbackSystemPrompt = `You are W-AI, the advanced AdsGo.ai platform assistant. Help the user with their digital marketing campaigns. Current user wallet balance context: ${walletContext}`;
      const localResponse = await this.aiService.generateContent(message, fallbackSystemPrompt);
      return { reply: localResponse };
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
      const response = await this.getChatbotResponse(contextualizedMessage, chatbot.systemPrompt);
      
      // Update analytics async
      this.chatbotModel.findByIdAndUpdate(chatbotId, { $inc: { totalConversations: 1 } }).exec().catch();

      return { reply: response };
    } catch (error) {
      this.logger.error('Error handling Chatbot response', error);
      return { reply: "I'm experiencing high traffic right now. Please try again later!" };
    }
  }

  private async getChatbotResponse(userPrompt: string, systemPrompt: string): Promise<string> {
    try {
      const agentServerUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8003';
      const response = await fetch(`${agentServerUrl}/api/v1/chatbot-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt, systemPrompt }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.reply) {
          this.logger.log('Generated chatbot response using Python Agent Server');
          return json.reply;
        }
      } else {
        const errText = await response.text();
        this.logger.warn(`Python Agent chatbot-response failed: ${response.status} - ${errText}`);
      }
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: Python Agent chatbot-response failed: ${e.message}`);
    }

    // Local NestJS AI fallback
    return this.aiService.generateContent(userPrompt, systemPrompt);
  }

  private getModelSafely(name: string): Model<any> | null {
    try {
      if (this.connection.modelNames().includes(name)) {
        return this.connection.model(name);
      }
    } catch (_) {}
    return null;
  }
}
