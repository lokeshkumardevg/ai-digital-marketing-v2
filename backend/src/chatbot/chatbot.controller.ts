import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get()
  async getChatbots() {
    return this.chatbotService.getAllChatbots();
  }

  @Post()
  async createChatbot(@Body() body: any) {
    return this.chatbotService.createChatbot(body);
  }

  @Post(':id/chat')
  async chat(@Param('id') id: string, @Body() body: { message: string, history?: any[] }) {
    return this.chatbotService.handleChatMessage(id, body.message, body.history);
  }
}
