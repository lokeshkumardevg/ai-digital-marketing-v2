import { NestFactory } from '@nestjs/core';
import { AppModule } from './backend/src/app.module';
import { UsersService } from './backend/src/users/users.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService);

  const users = await usersService.findAll();
  const user = users.find(u => u.googleAccessToken);

  if (!user) {
    console.log('No user with googleAccessToken found');
    process.exit(0);
  }

  const devToken = configService.get('GOOGLE_DEVELOPER_TOKEN');
  console.log('Using token for user:', user.email);

  const customerRes = await fetch('https://googleads.googleapis.com/v16/customers:listAccessibleCustomers', {
    headers: {
      'Authorization': `Bearer ${user.googleAccessToken}`,
      'developer-token': devToken || ''
    }
  });
  const customerData = await customerRes.json();
  console.log(JSON.stringify(customerData, null, 2));

  process.exit(0);
}
bootstrap();
