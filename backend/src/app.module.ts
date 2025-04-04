import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { AIModule } from './ai/ai.module';
import { SummarizeController } from './summarize/summarize.controller';
import { SummarizeService } from './summarize/summarize.service';
import { SummarizeModule } from './summarize/summarize.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CorsMiddleware } from './cors.middleware';
import { SavedTextModule } from './saved-text/saved-text.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule,AIModule,SummarizeModule,SavedTextModule,ConfigModule.forRoot({
    isGlobal: true, // Permet d'accéder aux variables dans toute l'application
  }),] ,
  controllers: [AppController, AuthController,SummarizeController],
  providers: [AppService,PrismaService,SummarizeService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
