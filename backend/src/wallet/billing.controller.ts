// billing.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  // GET /billing/plans
  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  // GET /billing/subscription/:userId
  @Get('subscription/:userId')
  getSubscription(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.billingService.getSubscription(userId);
  }

  // POST /billing/subscription/upgrade
  // Body: { userId, planId, successUrl, cancelUrl }
  @Post('subscription/upgrade')
  upgradeSubscription(
    @Body()
    body: {
      userId: string;
      planId: string;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    if (!body.userId || !body.planId) {
      throw new BadRequestException('userId and planId are required');
    }
    return this.billingService.upgradeSubscription(
      body.userId,
      body.planId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  // POST /billing/subscription/verify
  // Body: { userId, orderId, paymentId, signature, planId }
  @Post('subscription/verify')
  verifySubscription(
    @Body()
    body: {
      userId: string;
      orderId: string;
      paymentId: string;
      signature: string;
      planId: string;
    },
  ) {
    const { userId, orderId, paymentId, signature, planId } = body;
    if (!userId || !orderId || !paymentId || !signature || !planId) {
      throw new BadRequestException('Missing required subscription verification fields');
    }
    return this.billingService.verifySubscriptionPayment(
      userId,
      orderId,
      paymentId,
      signature,
      planId,
    );
  }

  // POST /billing/subscription/cancel
  // Body: { userId }
  @Post('subscription/cancel')
  cancelSubscription(@Body() body: { userId: string }) {
    if (!body.userId) throw new BadRequestException('userId is required');
    return this.billingService.cancelSubscription(body.userId);
  }

  // GET /billing/wallet/balance/:userId
  @Get('wallet/balance/:userId')
  getWalletBalance(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.billingService.getWalletBalance(userId);
  }

  // GET /billing/wallet/transactions/:userId?page=1&limit=10
  @Get('wallet/transactions/:userId')
  getWalletTransactions(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.billingService.getWalletTransactions(userId, +page, +limit);
  }

  // POST /billing/wallet/recharge
  // Body: { userId, amount, description? }
  @Post('wallet/recharge')
  rechargeWallet(
    @Body() body: { userId: string; amount: number; description?: string },
  ) {
    if (!body.userId) throw new BadRequestException('userId is required');
    return this.billingService.rechargeWallet(body.userId, body.amount, body.description);
  }

  // GET /billing/analytics/:userId
  @Get('analytics/:userId')
  getAnalytics(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.billingService.getAnalytics(userId);
  }
}
