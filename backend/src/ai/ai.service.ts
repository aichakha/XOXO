import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { exec } from 'child_process';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { promisify } from 'util';
const execPromise = promisify(exec);
@Injectable()
export class AIService {
  async transcribeAudio(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new InternalServerErrorException(`Fichier introuvable: ${filePath}`);
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      console.log("📤 Envoi du fichier pour transcription...");
      const response = await axios.post('https://bf2c-154-111-224-232.ngrok-free.app/transcribe/', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      console.log("✅ Réponse de l'API:", response.data);
      if (response.data && response.data.text) {
        return response.data.text;
      } else {
        console.error("🚨 Aucune transcription reçue !");
        throw new InternalServerErrorException('La transcription n\'a pas été générée.');
      }
    } catch (error) {
      console.error("🚨 Erreur de transcription:", (error as any).message);
      throw new InternalServerErrorException(`Erreur de transcription: ${(error as any).message}`);
    }
  }

  async downloadAudio(url: string): Promise<string> {
    const filePath = 'temp_audio_from_url.wav';
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
      throw new InternalServerErrorException('Erreur lors du téléchargement du fichier audio.');
    }

    fs.writeFileSync(filePath, response.data); // Sauvegarde le fichier
    return filePath;
  }

  async processUrl(url: string): Promise<string> {
    console.log("🔄 Téléchargement de l'audio avec yt-dlp...");
  
    const outputPath = `output.mp3`; // Définir un nom de fichier standard
  
    try {
      // Télécharger uniquement l'audio et le convertir en MP3
      await execPromise(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o ${outputPath} "${url}"`);
  
      if (!fs.existsSync(outputPath)) {
        throw new Error("Le fichier audio n'a pas été téléchargé correctement.");
      }
  
      console.log(`✅ Audio téléchargé et enregistré sous : ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error("🚨 Erreur lors du téléchargement avec yt-dlp:", (error as any).message);
      throw new Error(`Erreur yt-dlp: ${(error as any).message}`);
    }
  }

  async sendToWhisper(mp3Path: string): Promise<string> {
    if (!fs.existsSync(mp3Path)) {
      throw new InternalServerErrorException(`Fichier introuvable: ${mp3Path}`);
    }
  
    const form = new FormData();
    form.append('file', fs.createReadStream(mp3Path));
  
    try {
      console.log("📤 Envoi du fichier audio à Whisper...");
      const response = await axios.post('https://bf2c-154-111-224-232.ngrok-free.app/transcribe', form, {
        headers: { ...form.getHeaders() },
      });
  
      console.log("✅ Réponse de Whisper:", response.data);
      return response.data.text;
    } catch (error) {
      console.error("🚨 Erreur de transcription:", (error as any).message);
      throw new InternalServerErrorException(`Erreur de transcription: ${(error as any).message}`);
    }finally {
      // 🔥 Supprime le fichier après envoi
      try {
        fs.unlinkSync(mp3Path);
        console.log(`🗑️ Fichier supprimé : ${mp3Path}`);
      } catch (err) {
        console.error("⚠️ Impossible de supprimer le fichier :", (err as any).message);
      }

  }
  
}
}
