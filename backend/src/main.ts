import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
config();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// In src/main.ts

async function bootstrap() {
  // Créer l'application NestJS avec Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Configurer body-parser pour gérer les requêtes volumineuses
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // ✅ Servir les fichiers statiques pour les uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // ✅ Activer CORS globalement avec des paramètres précis
  app.enableCors({
    origin: ['http://localhost:8100'], // Autorise le frontend Ionic
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Autorise les cookies et authentifications
  });

  // 🚀 Lancer l'application sur le port 3000
  await app.listen(3000);
}

bootstrap();

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
