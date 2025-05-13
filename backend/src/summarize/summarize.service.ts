import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SummarizeService {
  async summarizeText(text: string): Promise<string> {
    try {
      // Appeler l'API FastAPI pour obtenir le résumé
      const response = await axios.post('https://bf2c-154-111-224-232.ngrok-free.app/summarize', { text });

      // Vérifier la réponse et renvoyer le résumé
      if (response.data && response.data.summary) {
        return response.data.summary;
      }

      // Si la réponse est invalide, lever une exception
      throw new InternalServerErrorException('Invalid response from summarizer');
    } catch (error) {
      console.error('Error while summarizing text:', error);
      throw new InternalServerErrorException('Error while summarizing text');
    }
  }
}
