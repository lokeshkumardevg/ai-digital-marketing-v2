import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async getWorkflows(@Query('websiteId') websiteId: string) {
    const workflows = await this.workflowsService.findAll(websiteId || 'default');
    return { status: 'success', data: workflows };
  }

  @Post()
  async createWorkflow(@Body() dto: any) {
    const workflow = await this.workflowsService.create({ ...dto, websiteId: dto.websiteId || 'default' });
    return { status: 'success', data: workflow };
  }

  @Put(':id/toggle')
  async toggleWorkflow(@Param('id') id: string) {
    const workflow = await this.workflowsService.toggleStatus(id);
    return { status: 'success', data: workflow };
  }
}
