import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  Param,
  Delete,
  Query,
  Res,
  BadRequestException,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import type { Response } from 'express';
import puppeteer from 'puppeteer';

import { CampaignService } from './campaigns.service';

@Controller('campaign')
export class CampaignController {

  constructor(
    private readonly service: CampaignService,
  ) { }

  @Post('discover')
  discover(
    @Body() body: {
      brandName: string;
      website: string;
    },
  ) {
    return this.service.discoverBrand(body);
  }

  @Post('budget-breakdown')
  budget(@Body() body: any) {
    return this.service.budgetBreakdown(body);
  }

  @Post('tempdraft')
  draft(@Body() body: any) {
    return this.service.createDraft(body);
  }

  @Post('publish/:id')
  @UseGuards(AuthGuard('jwt'))
  publish(@Param('id') id: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    return this.service.publish(id, undefined, authUserId);
  }

  @Post('publish')
  @UseGuards(AuthGuard('jwt'))
  async publishWithBody(@Body() body: any, @Req() req: any) {
    try {
      const authUserId = req.user?.id ?? req.user?.sub;
      return await this.service.publish(body.campaignId || body.id, body, authUserId);
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      const msg = err?.message || 'Failed to publish campaign';
      throw new BadRequestException(msg);
    }
  }

  @Post('optimize')
  @UseGuards(AuthGuard('jwt'))
  async optimizeCampaign(@Body() body: any, @Req() req: any) {
    try {
      const authUserId = req.user?.id ?? req.user?.sub;
      return await this.service.optimizeCampaign({ ...body, authUserId });
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      const msg = err?.message || 'Failed to optimize campaign';
      throw new BadRequestException(msg);
    }
  }

  @Put('google/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateGoogleCampaign(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const authUserId = req.user?.id ?? req.user?.sub;
      const targetUserId = body.userId || authUserId;
      if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
        throw new ForbiddenException('Access Denied: You can only update Google campaigns for your own tenant.');
      }
      return await this.service.updateGoogleCampaign(targetUserId, id, body);
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      const msg = err?.message || 'Failed to update Google campaign';
      throw new BadRequestException(msg);
    }
  }

  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'))
  status(@Param('id') id: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    return this.service.getStatus(id, authUserId);
  }

  @Get(':id/live-dashboard')
  @UseGuards(AuthGuard('jwt'))
  live(@Param('id') id: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    return this.service.getLiveDashboard(id, authUserId);
  }

  // ============================================
  // SESSION APIs
  // ============================================

  // GET /session/:userId
  @Get('session/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getSession(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only access your own session.');
    }
    return this.service.getSession(userId);
  }

  // POST /session/:userId
  @Post('session/:userId')
  @UseGuards(AuthGuard('jwt'))
  async saveSession(
    @Param('userId') userId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only save your own session.');
    }
    return this.service.saveSession(userId, body);
  }

  // DELETE /session/:userId
  @Delete('session/:userId')
  @UseGuards(AuthGuard('jwt'))
  async deleteSession(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only delete your own session.');
    }
    return this.service.deleteSession(userId);
  }

  // ============================================
  // WEBSITE SCREENSHOT API
  // ============================================

  @Get('screenshot')
  async captureWebsite(
    @Query('url') url: string,
    @Res() res: Response,
  ) {

    let browser: any;

    try {

      if (!url) {
        throw new BadRequestException(
          'URL is required',
        );
      }

      const cleanUrl = url.startsWith('http')
        ? url
        : `https://${url}`;

      browser = await puppeteer.launch({
        headless: true,

        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });

      const page = await browser.newPage();

      // desktop viewport
      await page.setViewport({
        width: 1440,
        height: 900,
      });

      // real browser user-agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
      );

      // open website
      await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // wait for full rendering
      await new Promise((resolve) =>
        setTimeout(resolve, 7000),
      );

      // remove common preloaders/loaders
      await page.evaluate(() => {

        const selectors = [
          '.loader',
          '.preloader',
          '#preloader',
          '#loader',
          '.loading',
          '.spinner',
          '.overlay',
          '.site-loader',
          '.page-loader',
        ];

        selectors.forEach((selector) => {

          const elements =
            document.querySelectorAll(selector);

          elements.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        });

        // enable scrolling
        document.body.style.overflow = 'auto';

      });

      // additional wait after removing loader
      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );

      // wait for homepage content
      await page.waitForSelector('body', {
        visible: true,
        timeout: 10000,
      });

      // screenshot
      const image = await page.screenshot({
        type: 'png',
        fullPage: false,
      });

      await browser.close();

      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      });

      return res.send(image);

    } catch (error) {

      console.log('SCREENSHOT ERROR:', error);

      if (browser) {
        await browser.close();
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to capture website',
      });
    }
  }
   // ---------------------------------------------
  // BRAND ASSETS API
  // ---------------------------------------------

  @Post('assets')
  async extractAssets(
    @Body('website') website: string,
  ) {
    return this.service.extractAssets(
      website,
    );
  }

  @Post('draft')
  @UseGuards(AuthGuard('jwt'))
  saveDraft(@Body() body: any, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (body.userId && body.userId !== authUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only save drafts for your own tenant.');
    }
    body.userId = authUserId;
    return this.service.saveDraft(body);
  }

  @Get('draft/:userId')
  @UseGuards(AuthGuard('jwt'))
  getDrafts(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only access your own drafts.');
    }
    return this.service.getDraftsByUser(userId);
  }

  @Post('x/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishX(@Body() body: any, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    const targetUserId = body.userId || authUserId;
    if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only publish campaigns for your own tenant.');
    }
    return this.service.publishXCampaign(targetUserId, body);
  }

  @Post('meta/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishMeta(@Body() body: any, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    const targetUserId = body.userId || authUserId;
    if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only publish campaigns for your own tenant.');
    }
    return this.service.publishMetaCampaign(targetUserId, body);
  }

  @Post('google/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishGoogle(@Body() body: any, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    const targetUserId = body.userId || authUserId;
    if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only publish campaigns for your own tenant.');
    }
    return this.service.publishGoogleCampaign(targetUserId, body);
  }

  @Post('linkedin/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishLinkedin(@Body() body: any, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    const targetUserId = body.userId || authUserId;
    if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only publish campaigns for your own tenant.');
    }
    return this.service.publishLinkedinCampaign(targetUserId, body);
  }

  @Get('linkedin/status/:userId')
  @UseGuards(AuthGuard('jwt'))
  async linkedinStatus(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only access your own LinkedIn status.');
    }
    return this.service.getLinkedinStatus(userId);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getCampaigns(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only access your own campaigns.');
    }
    return this.service.getCampaignsByUser(userId);
  }

  @Post(':id/toggle-status')
  @UseGuards(AuthGuard('jwt'))
  async toggleStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    const authUserId = req.user?.id ?? req.user?.sub;
    return this.service.toggleCampaignStatus(id, status, authUserId);
  }

  @Get('meta/billing-status/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getMetaBillingStatus(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only access your own Meta billing status.');
    }
    return this.service.getMetaBillingStatus(userId);
  }

  @Post('google/provision')
  @UseGuards(AuthGuard('jwt'))
  async provisionGoogleAds(@Body('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    const targetUserId = userId || authUserId;
    if (authUserId !== targetUserId && req.user?.role !== 'superadmin' && req.user?.role !== 'admin') {
      throw new ForbiddenException('Access Denied: You can only provision accounts for your own tenant.');
    }
    return this.service.provisionGoogleAdsAccount(targetUserId);
  }
}