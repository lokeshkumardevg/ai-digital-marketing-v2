// src/messaging/inbox/inbox.controller.ts
// All routes need a logged-in user; every query is scoped to req.user.id (which already
// reflects admin impersonation in JwtStrategy), so users can only ever see their own inbox.
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InboxService } from './inbox.service';
import { NewConversationDto, SendMessageDto, SetStatusDto } from './dto/inbox.dto';

@Controller('messaging/inbox')
@UseGuards(AuthGuard('jwt'))
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  private uid(req: any): string {
    return String(req.user?.id || req.user?._id || req.user?.userId);
  }

  /** Which channels are connected + unread counts per channel */
  @Get('channels')
  channels(@Req() req: any) {
    return this.inbox.getChannels(this.uid(req));
  }

  /** Link the user's Facebook Pages + Instagram business accounts (needs Meta login done in Settings) */
  @Post('connect/meta')
  connectMeta(@Req() req: any) {
    return this.inbox.connectMeta(this.uid(req));
  }

  /** Pull the latest messages from every connected channel */
  @Post('sync')
  sync(@Req() req: any, @Query('force') force?: string) {
    return this.inbox.syncAll(this.uid(req), force === 'true');
  }

  @Get('conversations')
  conversations(
    @Req() req: any,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('unread') unread?: string,
    @Query('search') search?: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inbox.listConversations(this.uid(req), { channel, status, unread, search, before, limit });
  }

  @Get('conversations/:id/messages')
  messages(@Req() req: any, @Param('id') id: string, @Query('before') before?: string, @Query('limit') limit?: string) {
    return this.inbox.getMessages(this.uid(req), id, before, limit);
  }

  @Post('conversations/:id/messages')
  reply(@Req() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.inbox.sendReply(this.uid(req), id, dto.text);
  }

  @Post('conversations/:id/read')
  read(@Req() req: any, @Param('id') id: string) {
    return this.inbox.markRead(this.uid(req), id);
  }

  @Patch('conversations/:id')
  status(@Req() req: any, @Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.inbox.setStatus(this.uid(req), id, dto.status);
  }

  /** Start a new thread (WhatsApp / Email only — Facebook, Instagram and Google do not allow cold messages) */
  @Post('conversations')
  start(@Req() req: any, @Body() dto: NewConversationDto) {
    return this.inbox.startConversation(this.uid(req), dto);
  }
}
