import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from 'multer'; // Correct type for file uploaded
import { AIService } from './ai.service';
import * as path from 'path';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // Define the 'transcribe' POST route
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file')) // Handle file upload with Multer
  async transcribe(@UploadedFile() file: MulterFile) {
    if (!file) {
      return { error: 'Aucun fichier reçu' }; // Handle missing file case
    }

    try {
      // Ensure the uploaded file path is absolute and valid
      const filePath = path.join(__dirname, '..', 'uploads', file.filename); // Ensure this matches the upload folder path

      // Call the AIService to process the file
      const transcription = await this.aiService.transcribeAudio(filePath);
      return { text: transcription }; // Return the transcribed text
    } catch (error) {
      // Handle transcription error
      return { error: 'Erreur de transcription : ' + error.message };
    }
  }
}
