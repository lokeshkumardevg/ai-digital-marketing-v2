import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './reputation.service';
import { ReviewSchema } from './schemas/review.schema';
import { CustomerSchema } from './schemas/customer.schema';
import { InsightSchema } from './schemas/insight.schema';
import { PostReviewMetaSchema } from './schemas/post-review-meta.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Review',   schema: ReviewSchema   },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'Insight',  schema: InsightSchema  },
      { name: 'PostReviewMeta', schema: PostReviewMetaSchema },
    ]),
  ],
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}