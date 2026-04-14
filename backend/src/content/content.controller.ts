import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ContentService } from './content.service';
import { FetchUrlImagesDto } from './dto/fetch-url-images.dto';
import { GenerateReferenceCreativeDto } from './dto/generate-reference-creative.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getAllContent() {
    return this.contentService.getAllContent();
  }

  @Post()
  async createManualCreative(
    @Body()
    body: {
      title: string;
      contentType: string;
      imageUrl: string;
      thumbnailUrl?: string;
      lifetimeStart?: string;
      lifetimeEnd?: string;
      platforms?: string[];
    },
  ) {
    return this.contentService.createManualCreative(body);
  }

  @Delete(':id')
  async deleteContent(@Param('id') id: string) {
    return this.contentService.deleteContent(id);
  }

  @Post('generate')
  async generateContent(
    @Body()
    body: {
      topic: string;
      contentType: string;
      tone: string;
      targetKeywords?: string[];
    },
  ) {
    return this.contentService.generateContent(body);
  }

  @Patch(':id/publish')
  async publishContent(@Param('id') id: string, @Body('platforms') platforms: string[]) {
    return this.contentService.publishContent(id, platforms || []);
  }

  @Post('fetch-url-images')
  async fetchUrlImages(@Body() body: FetchUrlImagesDto) {
    return this.contentService.fetchUrlImages(body.url);
  }

  @Post('generate-reference-creative')
  async generateReferenceCreative(@Body() body: GenerateReferenceCreativeDto) {
    return this.contentService.generateReferenceCreative(body);
  }
}