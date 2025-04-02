import { Module } from '@nestjs/common';
import { SavedTextController } from './saved-text.controller';
import { SavedTextService } from './saved-text.service';


@Module({
  controllers: [SavedTextController], // <== Vérifie que c'est bien là
  providers: [SavedTextService],
})
export class SavedTextModule {}