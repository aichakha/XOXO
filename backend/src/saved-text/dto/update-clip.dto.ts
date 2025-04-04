import{PartialType }from '@nestjs/mapped-types';
import { CreateSavedTextDto } from './create-saved-text.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateClipDto extends PartialType(CreateSavedTextDto) {

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
  
  @IsOptional()
  @IsString()
  title?: string; 
  
  @IsOptional()  // Ajout de @IsOptional() pour éviter les erreurs si ce champ est absent
  @IsString()
  content?:string; // Ajout du titre optionnel
}


