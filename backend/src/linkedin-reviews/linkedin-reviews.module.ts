import { Module } from '@nestjs/common';
import { LinkedInReviewsController } from './linkedin-reviews.controller';
import { LinkedInReviewsService } from './linkedin-reviews.service';
import { UsersModule } from '../users/users.module'; // adjust path to your existing UsersModule

@Module({
  imports: [UsersModule],
  controllers: [LinkedInReviewsController],
  providers: [LinkedInReviewsService],
  exports: [LinkedInReviewsService], // exported so SyncService can reuse it
})
export class LinkedInReviewsModule {}