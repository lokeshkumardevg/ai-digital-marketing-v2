import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { AuthGuard } from '@nestjs/passport';
import { PublishSocialDto } from './dto/publish-social.dto';
import { ScheduleSocialDto } from './dto/schedule-social.dto';
import { Request } from 'express';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  async getPosts(@Req() req: Request & { user?: any }, @Query('workspaceId') workspaceId?: string) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const posts = await this.socialService.findAll(userId, workspaceId);
    return { status: 'success', data: posts };
  }

  @Post('publish')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async publishPost(@Req() req: Request & { user?: any }, @Body() dto: PublishSocialDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const post = await this.socialService.publishPost(userId, dto);
    return { status: 'success', data: post };
  }

  @Post('schedule')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async schedulePost(@Req() req: Request & { user?: any }, @Body() dto: ScheduleSocialDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const post = await this.socialService.schedulePost(userId, dto);
    return { status: 'success', data: post };
  }

  @Get('connections')
  async getConnections(@Req() req: Request & { user?: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return {
      status: 'success',
      data: await this.socialService.getConnections(userId),
    };
  }
}
