import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { AppLogger } from './logger/app-logger.service';
import { LogsService } from './logs/logs.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const appLogger = await app.resolve(AppLogger);
  const logsService = app.get(LogsService);
  appLogger.setLogsService(logsService);

  app.useLogger(appLogger);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Enable Global CORS for React Frontend Client
  const rawOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
  const allowedOrigins = new Set<string>();

  rawOrigins.forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed) {
      allowedOrigins.add(trimmed);
      // Automatically allow www version if it's a non-www domain, and vice versa
      if (trimmed.startsWith('https://') && !trimmed.startsWith('https://www.')) {
        allowedOrigins.add(trimmed.replace('https://', 'https://www.'));
      } else if (trimmed.startsWith('https://www.')) {
        allowedOrigins.add(trimmed.replace('https://www.', 'https://'));
      }
    }
  });

  // Explicitly add production URLs just in case FRONTEND_URL is missing in server .env
  allowedOrigins.add('https://wheedletechnologies.tech');
  allowedOrigins.add('https://www.wheedletechnologies.tech');

  app.enableCors({
    origin: true, // Allow all origins dynamically
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('running port ', process.env.PORT)
}
bootstrap();
