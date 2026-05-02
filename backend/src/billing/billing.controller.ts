import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

  @Post('razorpay/create-order')
  async createOrder(@Body() body: { amount: number; tenantId: string }) {
    const order = await this.billingService.createRazorpayOrder(
      body.amount,
      body.tenantId,
    );
    return { status: 'success', order };
  }

  @Post('razorpay/verify')
  async verifyPayment(
    @Body()
    body: {
      tenantId: string;
      amount: number;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const result = await this.billingService.verifyAndRecharge(
      body.tenantId,
      body.amount,
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );
    if (!result.success) {
      throw new HttpException(
        result.error ?? 'Verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { status: 'success', data: result.transaction };
  }
}
