// wallet.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

import { WalletSchema } from './wallet.schema';
import { TransactionSchema } from './transaction.schema';
import { SubscriptionSchema } from './subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Wallet', schema: WalletSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Subscription', schema: SubscriptionSchema }, // ✅ was missing — caused the crash
    ]),
  ],
  controllers: [WalletController, BillingController],
  providers: [WalletService, BillingService],
  exports: [WalletService, BillingService],
})
export class WalletModule {}
