// brand.controller.ts
import {
  Controller, Get, Post, Delete,
  Param, Body, Query,
  Logger,
} from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('campaign')
export class BrandController {
  private readonly logger = new Logger(BrandController.name);

  constructor(private readonly brandService: BrandService) {}

  // GET /campaign/brands/:userId
  // → workspaceSlice fetchBrands thunk
  @Get('brands/:userId')
  getBrands(@Param('userId') userId: string) {
    this.logger.log(`[GET] brands for userId=${userId}`);
    return this.brandService.getBrandsByUser(userId);
  }

  // POST /campaign/brand-save/:userId
  // → Campaigns.tsx handleBrandFormSubmit (sends full CampaignSession snapshot)
  // → Campaigns.tsx handleBrandReplaceConfirm (?forceReplace=true)
  // → workspaceSlice saveBrand thunk
  @Post('brand-save/:userId')
  saveBrand(
    @Param('userId') userId: string,
    @Body() body: any,
    @Query('forceReplace') forceReplace?: string,
  ) {
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
  // → workspaceSlice persistActiveBrand thunk
  @Post('brand-active/:userId')
  setActiveBrand(
    @Param('userId') userId: string,
    @Body('brandId') brandId: string,
  ) {
    this.logger.log(`[POST] brand-active userId=${userId} brandId=${brandId}`);
    return this.brandService.setActiveBrand(userId, brandId);
  }

  // DELETE /campaign/brand/:userId
  @Delete('brand/:userId')
  deleteBrand(@Param('userId') userId: string) {
    this.logger.log(`[DELETE] brand userId=${userId}`);
    return this.brandService.deleteBrand(userId);
  }
}