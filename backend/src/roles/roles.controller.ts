import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles(@Query('workspaceId') workspaceId: string) {
    const roles = await this.rolesService.findAll(workspaceId || 'default');
    return { status: 'success', data: roles };
  }

  @Post()
  async createRole(@Body() dto: any) {
    const role = await this.rolesService.create({ ...dto, workspaceId: dto.workspaceId || 'default' });
    return { status: 'success', data: role };
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() dto: any) {
    const role = await this.rolesService.update(id, dto);
    return { status: 'success', data: role };
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return { status: 'success' };
  }
}
