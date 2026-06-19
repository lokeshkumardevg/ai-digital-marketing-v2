import { Module } from '@nestjs/common';
import { MetaReviewsController } from './meta-reviews.controller';
import { MetaReviewsService } from './meta-reviews.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MetaReviewsController],
  providers: [MetaReviewsService],
  exports: [MetaReviewsService], // export so dashboard aggregator can import it later
})
export class MetaReviewsModule {}