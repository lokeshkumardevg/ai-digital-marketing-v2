import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { GeneratePostDto } from '../dto/generate-post.dto';
import { ImageGeneratorService } from '../services/image-generator.service';

@Controller('platformposts')
export class PlatformPostsController {
  constructor(
    private readonly imageService: ImageGeneratorService,
  ) {}

  @Post('generate')
  async generate(
    @Body() body: GeneratePostDto,
  ) {
    const images =
      await this.imageService.generateImages(
        body,
      );

    return {
      success: true,
      campaignId: body.campaignId,
      images,
    };
  }
}