import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GoogleBusinessService } from './google-business.service';
import { GoogleBusinessController } from './google-business.controller';
import { UsersModule } from '../users/users.module'; // ✅ import UsersModule

@Module({
  imports: [
    ConfigModule,
    UsersModule, // ✅ gives access to UsersService
  ],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}