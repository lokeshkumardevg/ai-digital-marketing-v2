import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const result = await this.notifService.findForUser(userId, {
      category: category || 'all',
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
    return { status: 'success', ...result };
  }

  @Get('count')
  async getCount(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const unread = await this.notifService.getUnreadCount(userId);
    return { status: 'success', unread };
  }

  @Patch(':id/read')
  async markOneRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub || req.user.id;
    await this.notifService.markAsRead(id, userId);
    return { status: 'success' };
  }

  @Patch('read-all')
  async markAllRead(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    await this.notifService.markAllAsRead(userId);
    return { status: 'success' };
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub || req.user.id;
    await this.notifService.deleteOne(id, userId);
    return { status: 'success' };
  }

  @Delete('clear-read')
  async clearRead(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    await this.notifService.deleteAllRead(userId);
    return { status: 'success' };
  }

  @Post('test')
  async sendTest(@Req() req: any, @Body() body: { type?: string; category?: string }) {
    const userId = req.user.sub || req.user.id;
    const notif = await this.notifService.create({
      userId,
      title: 'Test Notification',
      message: `This is a test ${body.type || 'info'} notification from Wheedle AI.`,
      type: (body.type as any) || 'info',
      category: (body.category as any) || 'system',
    });
    return { status: 'success', data: notif };
  }
}
