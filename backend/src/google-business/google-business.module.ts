import { Module } from '@nestjs/common';
import { GoogleBusinessService } from './google-business.service';
import { GoogleBusinessController } from './google-business.controller';

@Module({
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}