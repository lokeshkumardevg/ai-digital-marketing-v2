import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './roles.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(workspaceId: string): Promise<Role[]> {
    const roles = await this.roleModel.find({ workspaceId }).exec();
    if (roles.length === 0) {
      // Mock bootstrap
      return [
        { _id: 'r1', name: 'Super Admin', color: '#ff0000', permissions: ['*'], isSystem: true, workspaceId },
        { _id: 'r2', name: 'Marketing Manager', color: '#ff0000', permissions: ['dashboard', 'crm', 'campaigns', 'content', 'analytics'], isSystem: false, workspaceId },
        { _id: 'r3', name: 'Content Creator', color: '#ff0000', permissions: ['dashboard', 'content'], isSystem: false, workspaceId },
      ] as any[];
    }
    return roles;
  }

  async create(dto: any): Promise<Role> {
    const newRole = new this.roleModel(dto);
    return newRole.save();
  }

  async update(id: string, dto: any): Promise<Role | null> {
    const originalRole = await this.roleModel.findById(id).exec();
    const updated = await this.roleModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (updated && originalRole && dto.permissions) {
      // Cascade permission update to all users holding this custom role
      await this.userModel.updateMany(
        { role: originalRole.name },
        { $set: { permissions: dto.permissions } }
      ).exec();
    }
    return updated;
  }

  async remove(id: string): Promise<any> {
    const role = await this.roleModel.findById(id).exec();
    if (role) {
      const defaultClientPerms = ['dashboard', 'ads', 'content', 'analytics', 'automation', 'billing'];
      await this.userModel.updateMany(
        { role: role.name },
        { $set: { role: 'client', permissions: defaultClientPerms } }
      ).exec();
    }
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
