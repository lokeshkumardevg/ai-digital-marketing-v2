import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LinkedInService } from './linkedin.service';
import { LinkedInController } from './linkedin.controller';

@Module({
  imports: [HttpModule],
  providers: [LinkedInService],
  controllers: [LinkedInController],
  exports: [LinkedInService],
})
export class LinkedInModule {}
