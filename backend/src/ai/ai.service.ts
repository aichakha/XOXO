import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class AIService {
  async transcribeAudio(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new InternalServerErrorException(`Fichier introuvable: ${filePath}`);
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post('http://localhost:8001/transcribe/', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (response.data && response.data.text) {
        return response.data.text;
      } else {
        throw new InternalServerErrorException('La transcription n\'a pas été générée.');
      }
    } catch (error) {
      throw new InternalServerErrorException(`Erreur de transcription: ${error.message}`);
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
}
