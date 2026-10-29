import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApprovalsService } from './approvals.service';
import { PlatformEventBusService } from '../event-bus/platform-event-bus.service';

@Controller('v1/approvals')
@UseGuards(AuthGuard('jwt'))
export class ApprovalsController {
  constructor(
    private readonly approvalsService: ApprovalsService,
    private readonly eventBus: PlatformEventBusService,
  ) {}

  @Get()
  async getApprovals(
    @Req() req: any,
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'all',
    @Query('coworker') coworker?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const orgId = req.user?.id || req.user?._id;
    return this.approvalsService.getApprovals(orgId, { status, coworker, page, limit });
  }

  @Get('count')
  async getPendingCount(@Req() req: any) {
    const orgId = req.user?.id || req.user?._id;
    const count = await this.approvalsService.getPendingCount(orgId);
    return { pendingCount: count };
  }

  @Get(':id')
  async getApprovalById(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user?.id || req.user?._id;
    return this.approvalsService.getApprovalById(id, orgId);
  }

  @Post(':id/approve')
  async approve(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { editedData?: Record<string, any>; notes?: string },
  ) {
    const user = { id: req.user?.id || req.user?._id, email: req.user?.email || 'user' };
    return this.approvalsService.approve(id, user, body);
  }

  @Post(':id/reject')
  async reject(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const user = { id: req.user?.id || req.user?._id, email: req.user?.email || 'user' };
    return this.approvalsService.reject(id, user, body);
  }

  /**
   * Acceptance Test Simulation Endpoint (for verifying event -> approval queue live):
   * Emits a simulated Google review or ad campaign anomaly to demonstrate full agent governance.
   */
  @Post('simulate')
  async simulateEvent(
    @Req() req: any,
    @Body() body: { type?: 'review' | 'budget'; rating?: number; reviewText?: string; reviewerName?: string },
  ) {
    const orgId = req.user?.id || req.user?._id;
    const type = body.type || 'review';

    if (type === 'budget') {
      const res = await this.eventBus.publish({
        eventType: 'campaign.schedule',
        idempotencyKey: `sim_budget_${Date.now()}`,
        orgId,
        payload: {
          campaignId: `cmp_sim_${Date.now().toString().slice(-4)}`,
          campaignName: 'Scale Top Performers Q4',
          currentBudget: 1500,
          suggestedShift: 1.25,
        },
      });
      return { success: true, message: 'Simulated budget anomaly event emitted to bus', event: res.event };
    }

    const rating = body.rating || 2;
    const reviewerName = body.reviewerName || 'Rahul Sharma';
    const reviewText =
      body.reviewText ||
      'I was disappointed with the delivery turnaround time. Product quality was okay, but customer support was hard to reach.';

    const res = await this.eventBus.publish({
      eventType: 'review.created',
      idempotencyKey: `sim_review_${Date.now()}`,
      orgId,
      payload: {
        reviewId: `rev_sim_${Date.now()}`,
        platform: 'google_business',
        reviewerName,
        rating,
        review_text: reviewText,
      },
    });

    return {
      success: true,
      message: 'Simulated review event emitted to bus. Stella (review_response) will draft reply and place in Approvals.',
      event: res.event,
    };
  }
}

