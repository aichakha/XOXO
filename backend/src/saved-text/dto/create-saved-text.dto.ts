import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSavedTextDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}