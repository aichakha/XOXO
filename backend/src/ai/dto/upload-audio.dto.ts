import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UploadAudioDto {
  @IsOptional()
  @IsNotEmpty()
  file: Express.Multer.File;

  @IsOptional() // Si ce champ est optionnel
  @IsUrl() // Vérifie que c'est une URL valide
  @IsString()
  mediaUrl: string;
}
