import { Controller, Get, Post, Body, Param, Put, Delete, Query, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '@nestjs/passport';

const hasManageRolesPermission = (user: any) => {
  if (!user) return false;
  const perms: string[] = user.permissions || [];
  return user.role === 'superadmin' || perms.includes('*') || perms.includes('manage_roles');
};

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles(@Req() req: any, @Query('workspaceId') workspaceId: string) {
    if (!hasManageRolesPermission(req.user)) {
      throw new ForbiddenException('You do not have permission to view roles.');
    }
    const roles = await this.rolesService.findAll(workspaceId || 'default');
    return { status: 'success', data: roles };
  }

  @Post()
  async createRole(@Req() req: any, @Body() dto: any) {
    if (!hasManageRolesPermission(req.user)) {
      throw new ForbiddenException('You do not have permission to create roles.');
    }
    const role = await this.rolesService.create({ ...dto, workspaceId: dto.workspaceId || 'default' });
    return { status: 'success', data: role };
  }

  @Put(':id')
  async updateRole(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    if (!hasManageRolesPermission(req.user)) {
      throw new ForbiddenException('You do not have permission to update roles.');
    }
    const role = await this.rolesService.update(id, dto);
    return { status: 'success', data: role };
  }

  @Delete(':id')
  async deleteRole(@Req() req: any, @Param('id') id: string) {
    if (!hasManageRolesPermission(req.user)) {
      throw new ForbiddenException('You do not have permission to delete roles.');
    }
    await this.rolesService.remove(id);
    return { status: 'success' };
  }
}

