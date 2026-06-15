// wallet.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // GET /wallet/balance/:userId
  @Get('balance/:userId')
  getBalance(@Param('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.walletService.getBalance(userId);
  }

  // POST /wallet/credit
  // Body: { userId, amount, description? }
  @Post('credit')
  credit(@Body() body: { userId: string; amount: number; description?: string }) {
    if (!body.userId) throw new BadRequestException('userId is required');
    return this.walletService.credit(body.userId, body.amount, body.description);
  }

  // POST /wallet/debit
  // Body: { userId, amount, description? }
  @Post('debit')
  debit(@Body() body: { userId: string; amount: number; description?: string }) {
    if (!body.userId) throw new BadRequestException('userId is required');
    return this.walletService.debit(body.userId, body.amount, body.description);
  }

  // GET /wallet/transactions/:userId?page=1&limit=10
  @Get('transactions/:userId')
  getTransactions(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.walletService.getTransactions(userId, +page, +limit);
  }

  // --- RAZORPAY INTEGRATION ---

  @Post('razorpay/create-order')
  createRazorpayOrder(@Body() body: { amountInRupees: number }) {
    if (!body.amountInRupees) throw new BadRequestException('amountInRupees is required');
    return this.walletService.createRazorpayOrder(body.amountInRupees);
  }

  @Post('razorpay/verify')
  verifyPayment(
    @Body() body: { userId: string; orderId: string; paymentId: string; signature: string; amountInRupees: number }
  ) {
    const { userId, orderId, paymentId, signature, amountInRupees } = body;
    if (!userId || !orderId || !paymentId || !signature || !amountInRupees) {
      throw new BadRequestException('Missing required payment verification fields');
    }
    return this.walletService.verifyPayment(userId, orderId, paymentId, signature, amountInRupees);
  }
}
