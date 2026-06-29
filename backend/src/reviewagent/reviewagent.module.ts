import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewAgent, ReviewAgentSchema }       from './reviewagent.model';
import { Recommendation, RecommendationSchema } from './recommendation.model';
import { PostReviewMeta, PostReviewMetaSchema } from './post-review-meta.model';  // ← new
import { ReviewAgentController }                from './reviewagent.controller';
import { ReviewAgentService }                   from './reviewagent.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewAgent.name,    schema: ReviewAgentSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
      { name: PostReviewMeta.name, schema: PostReviewMetaSchema },  // ← new
    ]),
  ],
  controllers: [ReviewAgentController],
  providers:   [ReviewAgentService],
})
export class ReviewAgentModule {}