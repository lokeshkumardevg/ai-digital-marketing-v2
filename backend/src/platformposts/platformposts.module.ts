import { Module } from '@nestjs/common';
import { PlatformPostsController } from './controller/platformposts.controller';
import { ImageGeneratorService } from './services/image-generator.service';
import { PlatformPromptService } from './services/platform-prompt.service';

@Module({
  controllers: [PlatformPostsController],
  providers: [
    ImageGeneratorService,
    PlatformPromptService,
  ],
})
export class PlatformPostsModule {}