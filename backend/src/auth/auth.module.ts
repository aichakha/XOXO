import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { SavedTextController } from 'src/saved-text/saved-text.controller';
import { SavedTextService } from 'src/saved-text/saved-text.service';
import { CorsMiddleware } from 'src/cors.middleware'; // Assurez-vous que le chemin est correct

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key', // Use a stronger secret in production
      signOptions: { expiresIn: '72h' },
    }),
  ],
  controllers: [AuthController, SavedTextController],
  providers: [AuthService, SavedTextService, PrismaService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes(AuthController);  // Applies to AuthController only
  }
}
