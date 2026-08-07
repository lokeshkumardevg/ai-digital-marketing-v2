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
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post('publish')
  async publishWithBody(@Body() body: any) {
    try {
      return await this.service.publish(body.campaignId || body.id, body);
    } catch (err: any) {
      const msg = err?.message || 'Failed to publish campaign';
      throw new BadRequestException(msg);
    }
  }

  @Post('optimize')
  async optimizeCampaign(@Body() body: any) {
    try {
      return await this.service.optimizeCampaign(body);
    } catch (err: any) {
      const msg = err?.message || 'Failed to optimize campaign';
      throw new BadRequestException(msg);
    }
  }

  @Put('google/:id')
  async updateGoogleCampaign(
    @Param('id') id: string,
    @Body() body: any
  ) {
    try {
      const userId = body.userId;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      return await this.service.updateGoogleCampaign(userId, id, body);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update Google campaign';
      throw new BadRequestException(msg);
    }
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.service.getStatus(id);
  }

  @Get(':id/live-dashboard')
  live(@Param('id') id: string) {
    return this.service.getLiveDashboard(id);
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
saveDraft(@Body() body: any) {
  return this.service.saveDraft(body);
}

@Get('draft/:userId')
@UseGuards(AuthGuard('jwt'))
getDrafts(
  @Param('userId') userId: string,
  @Req() req: any,
) {
  const authUserId = req.user?.id ?? req.user?.sub;
  if (authUserId !== userId) {
    throw new ForbiddenException('Access Denied: You can only access your own drafts.');
  }
  return this.service.getDraftsByUser(userId);
}

  @Post('x/publish')
  async publishX(@Body() body: any) {
    return this.service.publishXCampaign(body.userId, body);
  }

  @Post('meta/publish')
  async publishMeta(@Body() body: any) {
    return this.service.publishMetaCampaign(body.userId, body);
  }

  @Post('google/publish')
  async publishGoogle(@Body() body: any) {
    return this.service.publishGoogleCampaign(body.userId, body);
  }

  @Post('linkedin/publish')
  async publishLinkedin(@Body() body: any) {
    return this.service.publishLinkedinCampaign(body.userId, body);
  }

  @Get('linkedin/status/:userId')
  @UseGuards(AuthGuard('jwt'))
  async linkedinStatus(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only access your own LinkedIn status.');
    }
    return this.service.getLinkedinStatus(userId);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getCampaigns(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only access your own campaigns.');
    }
    return this.service.getCampaignsByUser(userId);
  }

  @Post(':id/toggle-status')
  async toggleStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.service.toggleCampaignStatus(id, status);
  }

  @Get('meta/billing-status/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getMetaBillingStatus(@Param('userId') userId: string, @Req() req: any) {
    const authUserId = req.user?.id ?? req.user?.sub;
    if (authUserId !== userId) {
      throw new ForbiddenException('Access Denied: You can only access your own Meta billing status.');
    }
    return this.service.getMetaBillingStatus(userId);
  }

  @Post('google/provision')
  async provisionGoogleAds(@Body('userId') userId: string) {
    return this.service.provisionGoogleAdsAccount(userId);
  }
}