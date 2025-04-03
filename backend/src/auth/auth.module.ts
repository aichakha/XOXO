// src/auth/auth.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

import { AuthGuard } from './jwt-auth.guard';
import { SavedTextController } from 'src/saved-text/saved-text.controller';
import { SavedTextService } from 'src/saved-text/saved-text.service';
import { CorsMiddleware } from 'src/cors.middleware'; // Assurez-vous que le chemin est correct
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key', // Mets une clé secrète plus forte en prod
      signOptions: { expiresIn: '72h' },
    }),
  ],
  controllers: [AuthController,SavedTextController],
  providers: [AuthService,SavedTextService, PrismaService, JwtStrategy, AuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  // Appliquer le middleware CORS à toutes les routes du contrôleur AuthController
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes(AuthController);  // Applique à AuthController seulement
  }
}
