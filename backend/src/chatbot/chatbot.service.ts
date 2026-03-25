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

  /**
   * Processes an incoming message for a specific chatbot instance using its custom System Prompt.
   */
  async handleChatMessage(chatbotId: string, message: string, history: Array<{ role: string; content: string }> = []): Promise<{ reply: string }> {
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
