import { Controller, Post, Body, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MessagingService } from './messaging.service';
import { CreateCampaignDto, UserDto } from './dto/create-campaign.dto';
import { ConnectableObservable } from 'rxjs';

@Controller('messaging')
export class MessagingController {
  private readonly logger = new Logger(MessagingController.name);
  constructor(private readonly messagingService: MessagingService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFile(
    @UploadedFile(new ParseFilePipe({
      validators: [new FileTypeValidator({ fileType: /^(text\/csv|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/plain)$/ })],
      fileIsRequired: true,
    })) file: Express.Multer.File,
  ): { success: boolean; count: number; users: UserDto[] } {
    this.logger.log(`File upload: ${file.originalname} (${file.size} bytes)`);
    const users = this.messagingService.processFile(file);
    return { success: true, count: users.length, users };
  }

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendCampaign(@Body() dto: CreateCampaignDto): Promise<{ success: boolean; queued: number; skipped: number; jobIds: (number | string)[]; message: string; }> {
    this.logger.log(`Campaign: type=${dto.type}, users=${dto.users?.length}`);
    console.log('Campaign message:', dto.message);
    const result = await this.messagingService.sendCampaign(dto);
    return { success: true, ...result, message: `${result.queued} messages queued, ${result.skipped} skipped.` };
  }
}
