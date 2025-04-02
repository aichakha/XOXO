import{PartialType }from '@nestjs/mapped-types';
import { CreateSavedTextDto } from './create-saved-text.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClipDto extends PartialType(CreateSavedTextDto) {
  @IsOptional()
  @IsString()
  title?: string; 
  
  @IsOptional()  // Ajout de @IsOptional() pour éviter les erreurs si ce champ est absent
  @IsString()
  content?:string; // Ajout du titre optionnel
}


