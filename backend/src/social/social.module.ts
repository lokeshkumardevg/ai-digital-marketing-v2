import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialPost, SocialPostSchema } from './social.schema';
import { AutoPostTopic, AutoPostTopicSchema } from './auto-post.schema';
import { AutoPostService } from './auto-post.service';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthController } from './social-auth.controller';
import { YoutubeService } from './youtube.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialPost.name, schema: SocialPostSchema },
      { name: AutoPostTopic.name, schema: AutoPostTopicSchema },
    ]),
    UsersModule,
    AuthModule,
    NotificationsModule,
    AiModule,
  ],
  controllers: [SocialController, SocialAuthController],
  providers: [SocialService, AutoPostService, SocialAuthService, YoutubeService],
  exports: [SocialService, AutoPostService, SocialAuthService],
})
export class SocialModule {}

