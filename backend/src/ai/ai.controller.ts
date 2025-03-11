import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'; // Correct type for file uploaded
import { AIService } from './ai.service';
import * as path from 'path';
import { UploadAudioDto } from './dto/upload-audio.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // Define the 'transcribe' POST route
 /*@Post('transcribe')
  @UseInterceptors(FileInterceptor('file')) // Handle file upload with Multer
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'Aucun fichier reçu' }; // Handle missing file case
    }
    // Vérifier le format du fichier
    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format de fichier non pris en charge.');
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
  }*/
    @Post('transcribe')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Dossier où enregistrer les fichiers
        filename: (req, file, cb) => {
          // Vérifie que le fichier a une extension correcte
          const originalExt = extname(file.originalname) || '.mp3'; 
          const uniqueSuffix = `${uuidv4()}${originalExt}`; // Génère un nom unique
          console.log("📂 Nouveau nom du fichier:", uniqueSuffix);
          cb(null, uniqueSuffix);
        },
      }),
    }))
    async transcribe(
      @UploadedFile() file: Express.Multer.File, 
      @Body() body: UploadAudioDto
    ) {
      console.log("📥 Requête reçue pour transcription...");
      let filePath: string;
  
      try {
        if (file) {
          // Si un fichier est uploadé, on l'utilise
          console.log("📂 Fichier uploadé:", file.originalname);
          console.log("📂 Chemin du fichier enregistré:", file.path);
          console.log("📂 Type MIME du fichier:", file.mimetype);
          filePath = path.resolve('uploads', file.filename);

        } else if (body.mediaUrl) {
          // Si une URL est fournie, on télécharge le fichier
          console.log("🌍 URL reçue:", body.mediaUrl);
          filePath = await this.aiService.downloadAudio(body.mediaUrl);
        } else {
          console.error("🚨 Aucun fichier ni URL fourni !");
          throw new BadRequestException('Aucun fichier ni URL fourni.');
        }
  
        // Appeler Whisper pour la transcription
        console.log("🔄 Envoi du fichier à Whisper...");
        const transcription = await this.aiService.transcribeAudio(filePath);
        console.log("📝 Transcription obtenue:", transcription);
        return { text: transcription };
      } catch (error) {
        return { error: 'Erreur de transcription : ' + error.message };
      }
    }
}
