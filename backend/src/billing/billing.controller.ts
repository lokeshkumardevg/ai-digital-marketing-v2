import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  async getSubscription() {
    return this.billingService.getSubscription();
  }

  @Get('plans')
  getPlans() {
    return this.billingService.PLANS;
  }

  @Post('checkout')
  async createCheckoutSession(@Body('planId') planId: string) {
    return this.billingService.createCheckoutSession(planId);
  }

  @Post('webhook/mock-success')
  async simulateWebhookSuccess(@Body('planId') planId: string) {
    return this.billingService.processPaymentSuccessWebhook('default_tenant', planId);
  }

  // --- WALLET ENDPOINTS ---
  @Get('wallet')
  async getWalletDetails() {
    return this.billingService.getWalletBalance();
  }

  @Post('wallet/recharge')
  async rechargeWallet(@Body('amount') amount: number) {
    const fakePaymentId = 'txn_' + Math.random().toString(36).substr(2, 9);
    return this.billingService.rechargeWallet('default_tenant', amount, fakePaymentId);
  }

  @Post('wallet/deduct')
  async deductWallet(@Body('amount') amount: number, @Body('reason') reason: string) {
    return this.billingService.deductWallet('default_tenant', amount, reason);
  }
}
