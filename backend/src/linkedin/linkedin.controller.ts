import { Controller, Get, Query } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';

@Controller('linkedin')
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Get('posts')
  getPosts() {
    return this.linkedInService.getPosts();
  }

  @Get('events')
  getEvents() {
    return this.linkedInService.getEvents();
  }

  // Paginated connections (used as "leads")
  @Get('connections')
  getConnections(@Query('start') start = '0', @Query('count') count = '100') {
    return this.linkedInService.getConnections(+start, +count);
  }
}
