import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialPost, SocialPostSchema } from './social.schema';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthController } from './social-auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SocialPost.name, schema: SocialPostSchema }]),
    UsersModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [SocialController, SocialAuthController],
  providers: [SocialService, SocialAuthService],
  exports: [SocialService, SocialAuthService],
})
export class SocialModule {}
