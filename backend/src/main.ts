import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.enableCors({
    origin: '*', // Autorise uniquement ton frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  
}
bootstrap();
