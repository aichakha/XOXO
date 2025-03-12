import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body, InternalServerErrorException  } from '@nestjs/common';
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

        }  else {
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

    @Post('process')
    async processFile(@Body() body: UploadAudioDto) {
      console.log("📝 Requête reçue pour transcription:", body);
    
      if (!body.url) {
        console.error("🚨 Aucune URL fournie !");
        throw new BadRequestException('URL requise.');
      }
    
      try {
        // Étape 1 : Télécharger l'audio
        const filePath = await this.aiService.processUrl(body.url);
    
        // Étape 2 : Envoyer le fichier à Whisper
        const transcription = await this.aiService.sendToWhisper(filePath);
    
        console.log("📝 Transcription obtenue:", transcription);
        return { text: transcription };
      } catch (error) {
        console.error("🚨 Erreur dans le traitement:", error.message);
        throw new InternalServerErrorException(`Erreur : ${error.message}`);
      }
    }
}
