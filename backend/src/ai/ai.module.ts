import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { AuthModule } from '../auth/auth.module'; // Importer AuthModule

import { MulterModule } from '@nestjs/platform-express';
import { JwtAuthGuard  } from '../auth/jwt-auth.guard';
@Module({
  imports: [AuthModule,
    MulterModule.register({
      dest: './uploads', // Assurez-vous que ce dossier existe
    }),
  ],
  controllers: [AIController],
  providers: [AIService,JwtAuthGuard ],
  exports: [AIService],
})
export class AIModule {}
