import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
@UseGuards(AuthGuard('jwt'))
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

  @Get(':id')
  async getChatbot(@Param('id') id: string) {
    return this.chatbotService.getChatbotById(id);
  }

  @Post(':id/chat')
  async chat(
    @Param('id') id: string,
    @Body() body: { message: string; history?: any[] },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.chatbotService.handleChatMessage(id, body.message, userId, body.history);
  }
}
