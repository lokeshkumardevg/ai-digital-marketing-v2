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
}
