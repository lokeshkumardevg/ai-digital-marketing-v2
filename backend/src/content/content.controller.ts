import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getAllContent() {
    return this.contentService.getAllContent();
  }

  @Post('generate')
  async generateContent(@Body() body: { topic: string; contentType: string; tone: string; targetKeywords?: string[] }) {
    return this.contentService.generateContent(body);
  }

  @Patch(':id/publish')
  async publishContent(@Param('id') id: string, @Body('platforms') platforms: string[]) {
    return this.contentService.publishContent(id, platforms || []);
  }
}
