import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../brand/brand.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Campaign') private campaignModel: Model<any>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleUserId(googleUserId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleUserId }).exec();
  }

  async create(userDto: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async update(id: string, updateDto: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).select('-passwordHash').exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).select('-passwordHash').exec();
  }

  async getAdminStats() {
    const [users, campaigns, brands] = await Promise.all([
      this.userModel.find().select('-passwordHash').exec(),
      this.campaignModel.find().exec(),
      this.brandModel.find().exec(),
    ]);

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const inactiveUsers = totalUsers - activeUsers;
    const combinedWalletBalance = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

    const totalCampaigns = campaigns.length;
    const statusBreakdown: Record<string, number> = { DRAFT: 0, ACTIVE: 0, COMPLETED: 0, FAILED: 0, PAUSED: 0 };
    const platformBreakdown: Record<string, number> = { Meta: 0, Google: 0, X: 0, LinkedIn: 0 };

    campaigns.forEach(c => {
      const status = (c.status || 'DRAFT').toUpperCase();
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      let plat = c.platform || 'Meta';
      if (plat.toLowerCase().includes('meta') || plat.toLowerCase().includes('facebook')) plat = 'Meta';
      else if (plat.toLowerCase().includes('google')) plat = 'Google';
      else if (plat.toLowerCase() === 'x' || plat.toLowerCase().includes('twitter')) plat = 'X';
      else if (plat.toLowerCase().includes('linkedin')) plat = 'LinkedIn';
      platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
    });

    const totalBrands = brands.length;

    // Detailed Clients list mapping
    const clientsList = users.map(u => {
      const userCampaigns = campaigns.filter(c => c.userId === u.id || c.userId === u._id?.toString());
      const userBrands = brands.filter(b => b.userId === u.id || b.userId === u._id?.toString());

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive !== false,
        subscriptionTier: u.subscriptionTier,
        walletBalance: u.walletBalance || 0,
        currency: u.currency || 'INR',
        campaignsCount: userCampaigns.length,
        brandsCount: userBrands.length,
        brands: userBrands.map(b => ({ id: b._id || b.brandId, name: b.name, url: b.url })),
        createdAt: (u as any).createdAt,
      };
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalCampaigns,
        totalBrands,
        combinedWalletBalance,
      },
      statusBreakdown,
      platformBreakdown,
      clients: clientsList,
    };
  }
}
