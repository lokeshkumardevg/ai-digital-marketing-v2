import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  async getPosts(@Query('workspaceId') workspaceId: string) {
    const posts = await this.socialService.findAll(workspaceId || 'default');
    return { status: 'success', data: posts };
  }

  @Post('schedule')
  async schedulePost(@Body() dto: any) {
    // Logic for AI Distro Simulation
    const post = await this.socialService.create({
      ...dto,
      status: 'Scheduled',
      scheduledFor: new Date(),
      workspaceId: dto.workspaceId || 'default'
    });
    return { status: 'success', data: post };
  }
}
