import { Module } from '@nestjs/common';
import { SavedTextController } from './saved-text.controller';
import { SavedTextService } from './saved-text.service';
import { AuthModule } from '../auth/auth.module'; // Vérifie le chemin correct
import { AuthGuard } from 'src/auth/jwt-auth.guard';


@Module({
  imports: [AuthModule], // Importer le module qui contient JwtService
  controllers: [SavedTextController], // <== Vérifie que c'est bien là
  providers: [SavedTextService,AuthGuard],
})
export class SavedTextModule {}