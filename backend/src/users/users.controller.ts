import { Controller, UseGuards, Get, Post, Body, Request, Patch, Param, Delete, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const hasPermission = (user: any, permission: string) => {
  if (!user) return false;
  const perms = user.permissions || [];
  return perms.includes('*') || perms.includes(permission) || user.role === 'superadmin';
};

const sanitizeUser = (user: any) => {
  if (!user) return user;
  const { passwordHash, ...result } = user.toObject ? user.toObject() : user;
  return result;
};

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Request() req: any) {
    if (!hasPermission(req.user, 'view_users')) {
      throw new ForbiddenException('You do not have permission to view user records.');
    }
    return this.usersService.findAll();
  }

  @Post()
  async createUser(@Request() req: any, @Body() createUserDto: CreateUserDto) {
    if (!hasPermission(req.user, 'manage_users')) {
      throw new ForbiddenException('Only super admins or user managers can create new users.');
    }

    if (!createUserDto.password || createUserDto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) {
      throw new BadRequestException('A user with that email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const created = await this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role || 'client',
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
      permissions: createUserDto.permissions || [],
    });

    return sanitizeUser(created);
  }

  @Patch(':id')
  async updateUser(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    if (!hasPermission(req.user, 'manage_users')) {
      throw new ForbiddenException('Only super admins or user managers can update users.');
    }

    if (id === req.user.id && updateDto.isActive === false) {
      throw new ForbiddenException('You cannot deactivate your own account.');
    }

    const payload: any = { ...updateDto };
    if (updateDto.password) {
      const salt = await bcrypt.genSalt(10);
      payload.passwordHash = await bcrypt.hash(updateDto.password, salt);
      delete payload.password;
    }

    const updated = await this.usersService.update(id, payload);
    if (!updated) {
      throw new NotFoundException('User not found.');
    }

    return updated;
  }

  @Delete(':id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    if (!hasPermission(req.user, 'manage_users')) {
      throw new ForbiddenException('Only super admins or user managers can delete users.');
    }

    if (id === req.user.id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException('User not found.');
    }

    return { success: true, id };
  }
}
