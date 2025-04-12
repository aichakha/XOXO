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
import { TextModule } from './text/text.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [PrismaModule,
    MongooseModule.forRoot('mongodb+srv://admin:admin@cluster.clfsx.mongodb.net/xoxo'),TextModule, AuthModule,AIModule,SummarizeModule,SavedTextModule] ,
  controllers: [AppController, AuthController,SummarizeController],
  providers: [AppService,PrismaService,SummarizeService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
