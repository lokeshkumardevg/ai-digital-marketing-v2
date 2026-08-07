// brand.controller.ts
import {
  Controller, Get, Post, Delete,
  Param, Body, Query,
  Logger,
  UseGuards, Req, ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BrandService } from './brand.service';

@Controller('campaign')
@UseGuards(AuthGuard('jwt'))
export class BrandController {
  private readonly logger = new Logger(BrandController.name);

  constructor(private readonly brandService: BrandService) {}

  // GET /campaign/brands/:userId
  @Get('brands/:userId')
  getBrands(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only access your own brand profiles.');
    }
    this.logger.log(`[GET] brands for userId=${userId}`);
    return this.brandService.getBrandsByUser(userId);
  }

  // POST /campaign/brand-save/:userId
  @Post('brand-save/:userId')
  saveBrand(
    @Param('userId') userId: string,
    @Body() body: any,
    @Req() req: any,
    @Query('forceReplace') forceReplace?: string,
  ) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only save your own brand profiles.');
    }
    this.logger.log(
      `[POST] brand-save userId=${userId} forceReplace=${forceReplace} ` +
      `brandName=${body?.brandDetails?.brand?.name || body?.brandDetails?.brandName || 'unknown'}`
    );
    return this.brandService.saveBrand(
      userId,
      body,
      forceReplace === 'true',
    );
  }

  // POST /campaign/brand-active/:userId
  @Post('brand-active/:userId')
  setActiveBrand(
    @Param('userId') userId: string,
    @Body('brandId') brandId: string,
    @Req() req: any,
  ) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only activate your own brand profiles.');
    }
    this.logger.log(`[POST] brand-active userId=${userId} brandId=${brandId}`);
    return this.brandService.setActiveBrand(userId, brandId);
  }

  // DELETE /campaign/brand/:userId
  @Delete('brand/:userId')
  deleteBrand(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only delete your own brand profiles.');
    }
    this.logger.log(`[DELETE] brand userId=${userId}`);
    return this.brandService.deleteBrand(userId);
  }
}