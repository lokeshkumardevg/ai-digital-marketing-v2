import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostReview, PostReviewSchema } from './post-review.schema';
import { MetaReviewsService } from './meta-reviews.service';
import { MetaReviewsController } from './meta-reviews.controller';
import { PostReviewSyncService } from './post-review-sync.service';
import { PostReviewQueryService } from './post-review-query.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReview.name, schema: PostReviewSchema },
    ]),
    UsersModule,
  ],
  controllers: [MetaReviewsController],
  providers: [
    MetaReviewsService,
    PostReviewSyncService,
    PostReviewQueryService,
  ],
  exports: [PostReviewQueryService, PostReviewSyncService],
})
export class MetaReviewsModule {}