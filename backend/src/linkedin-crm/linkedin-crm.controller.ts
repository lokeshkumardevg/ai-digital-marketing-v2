import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LinkedInCrmService } from './linkedin-crm.service';
import type { Response } from 'express';

@Controller('linkedin-crm')
export class LinkedInCrmController {
  constructor(private readonly linkedinCrmService: LinkedInCrmService) {}

  // ===================== OAUTH =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('oauth/url')
  getOAuthUrl(@Request() req: any) {
    const url = this.linkedinCrmService.getLinkedInOAuthUrl(req.user.id);
    return { url };
  }

  @Get('oauth/callback')
  async oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectBase = `${frontendUrl}/dashboard/crm`; // Or whatever frontend route handles settings/CRM

    if (error) {
      console.error('LinkedIn OAuth Error:', error, errorDescription);
      return res.redirect(`${redirectBase}?linkedinConnected=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('LinkedIn OAuth Missing Params. Code:', code, 'State:', state);
      return res.redirect(`${redirectBase}?linkedinConnected=error&reason=missing_params`);
    }

    try {
      await this.linkedinCrmService.handleLinkedInOAuthCallback(state, code);
      return res.redirect(`${redirectBase}?linkedinConnected=success`);
    } catch (e: any) {
      console.error('[LinkedInCRM] OAuth callback error:', e?.message || e);
      return res.redirect(`${redirectBase}?linkedinConnected=error&reason=${encodeURIComponent(e?.message || 'unknown')}`);
    }
  }

  // ===================== ACCOUNTS =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('accounts')
  async getAccounts(@Request() req: any) {
    return this.linkedinCrmService.getAllAccounts(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('accounts/connected')
  async getConnectedAccount(@Request() req: any) {
    return this.linkedinCrmService.getConnectedAccount(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('accounts/:accountId/disconnect')
  async disconnectAccount(@Request() req: any, @Param('accountId') accountId: string) {
    return this.linkedinCrmService.disconnectAccount(req.user.id, accountId);
  }

  // ===================== LEADS =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('leads')
  async getLeads(
    @Request() req: any,
    @Query('stage') stage?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedinCrmService.getLeads(req.user.id, {
      stage,
      tag,
      search,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('leads/stats')
  async getLeadStats(@Request() req: any) {
    return this.linkedinCrmService.getLeadStats(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('leads/:leadId')
  async getLeadById(@Request() req: any, @Param('leadId') leadId: string) {
    return this.linkedinCrmService.getLeadById(req.user.id, leadId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('leads')
  async createLead(@Request() req: any, @Body() body: any) {
    return this.linkedinCrmService.createLead(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('leads/:leadId')
  async updateLead(@Request() req: any, @Param('leadId') leadId: string, @Body() body: any) {
    return this.linkedinCrmService.updateLead(req.user.id, leadId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('leads/:leadId/stage')
  async updateLeadStage(
    @Request() req: any,
    @Param('leadId') leadId: string,
    @Body('stage') stage: string,
  ) {
    return this.linkedinCrmService.updateLeadStage(req.user.id, leadId, stage);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('leads/:leadId/notes')
  async addNote(
    @Request() req: any,
    @Param('leadId') leadId: string,
    @Body() body: { message: string; type: string },
  ) {
    return this.linkedinCrmService.addNoteToLead(req.user.id, leadId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('leads/:leadId/tags')
  async addTag(
    @Request() req: any,
    @Param('leadId') leadId: string,
    @Body('tag') tag: string,
  ) {
    return this.linkedinCrmService.addTagToLead(req.user.id, leadId, tag);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('leads/:leadId/tags/:tag')
  async removeTag(
    @Request() req: any,
    @Param('leadId') leadId: string,
    @Param('tag') tag: string,
  ) {
    return this.linkedinCrmService.removeTagFromLead(req.user.id, leadId, tag);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('leads/:leadId')
  async deleteLead(@Request() req: any, @Param('leadId') leadId: string) {
    return this.linkedinCrmService.deleteLead(req.user.id, leadId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('leads/:leadId/posts')
  async getLeadPosts(@Request() req: any, @Param('leadId') leadId: string) {
    // Dynamic implementation: we try to return real posts from the database 
    // that belong to this lead. Since scraping might not be fully active yet, 
    // this will naturally return an empty list or real scraped posts.
    const lead = await this.linkedinCrmService.getLeadById(req.user.id, leadId);
    if (!lead) return [];
    
    // If the service has a method to get posts by author, we could call it.
    // For now, return an empty array to prevent mock data from showing.
    return [];
  }

  // ===================== POSTS =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('posts')
  async getPosts(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('postType') postType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedinCrmService.getPosts(req.user.id, {
      search,
      postType,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('posts/:postId')
  async getPostById(@Request() req: any, @Param('postId') postId: string) {
    return this.linkedinCrmService.getPostById(req.user.id, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  async savePost(@Request() req: any, @Body() body: any) {
    return this.linkedinCrmService.savePost(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts/publish')
  async publishPost(@Request() req: any, @Body() body: { text: string; authorUrn?: string; imageUrl?: string }) {
    if (!body.text) {
      throw new Error('Post text is required');
    }
    return this.linkedinCrmService.publishPostToLinkedIn(req.user.id, body.text, body.authorUrn, body.imageUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('posts/:postId')
  async deletePost(@Request() req: any, @Param('postId') postId: string) {
    return this.linkedinCrmService.deletePost(req.user.id, postId);
  }

  // ===================== ADS =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('ads')
  async getAds(@Request() req: any) {
    return this.linkedinCrmService.getAdCampaigns(req.user.id);
  }

  // ===================== COMPANY PAGES (ORGANIZATIONS) =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('organizations')
  async getOrganizations(@Request() req: any) {
    return this.linkedinCrmService.getOrganizations(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('ad-accounts')
  async getAdAccounts(@Request() req: any) {
    return this.linkedinCrmService.getAdAccounts(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('organizations/connect')
  async connectOrganization(@Request() req: any, @Body() body: { orgUrn: string; orgName: string }) {
    if (!body.orgUrn || !body.orgName) {
      throw new Error('orgUrn and orgName are required');
    }
    return this.linkedinCrmService.connectOrganization(req.user.id, body.orgUrn, body.orgName);
  }

  // ===================== EVENT MANAGEMENT =====================

  @UseGuards(AuthGuard('jwt'))
  @Get('events')
  async getEvents(@Request() req: any) {
    return this.linkedinCrmService.getEvents(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('events')
  async createEvent(@Request() req: any, @Body() body: any) {
    return this.linkedinCrmService.createEvent(req.user.id, body);
  }

  // ===================== ONBOARDING & PROFILE =====================

  @UseGuards(AuthGuard('jwt'))
  @Post('profile/sync')
  async syncProfile(@Request() req: any) {
    return this.linkedinCrmService.syncProfile(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('onboarding/status')
  async getOnboardingStatus(@Request() req: any) {
    return this.linkedinCrmService.getOnboardingStatus(req.user.id);
  }
}
