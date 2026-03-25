import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialPost, SocialPostSchema } from './social.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SocialPost.name, schema: SocialPostSchema }]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
