import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './roles.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async findAll(workspaceId: string): Promise<Role[]> {
    const roles = await this.roleModel.find({ workspaceId }).exec();
    if (roles.length === 0) {
      // Mock bootstrap
      return [
        { _id: 'r1', name: 'Super Admin', permissions: ['*'], isSystem: true, workspaceId },
        { _id: 'r2', name: 'Marketing Manager', permissions: ['dashboard', 'crm', 'campaigns', 'content', 'analytics'], isSystem: false, workspaceId },
        { _id: 'r3', name: 'Content Creator', permissions: ['dashboard', 'content'], isSystem: false, workspaceId },
      ] as any[];
    }
    return roles;
  }

  async create(dto: any): Promise<Role> {
    const newRole = new this.roleModel(dto);
    return newRole.save();
  }

  async update(id: string, dto: any): Promise<Role | null> {
    return this.roleModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
