import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule,AIModule] ,
  controllers: [AppController, AuthController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
