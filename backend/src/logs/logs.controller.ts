import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('level') level?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.logsService.getLogs({ startDate, endDate, level, category, page, limit });
  }

  @Get('categories')
  @UseGuards(AuthGuard('jwt'))
  async getCategories() {
    const categories = await this.logsService.getCategories();
    return { data: categories };
  }
}
