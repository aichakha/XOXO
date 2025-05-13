import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { franc } from 'franc-min'; // Utilisation de la bibliothèque franc-min

@Injectable()
export class TranslationService {
  // Fonction pour détecter la langue du texte
  async detectLanguage(text: string): Promise<string> {
    const detectedLang = franc(text);

    if (detectedLang === 'und') {
      throw new Error('Unable to detect language');
    }

    return detectedLang;
  }

  // Fonction pour traduire un texte
  async translate(text: string, srcLang: string, tgtLang: string): Promise<string> {
    try {
      // Validation des champs
      if (!text || !srcLang || !tgtLang) {
        throw new InternalServerErrorException('Missing required translation fields');
      }

      const payload = {
        text: [text], 
        source_lang: srcLang, 
        target_lang: tgtLang, 
      };

      console.log('Sending translation request:', payload); // pour debug

      const response = await axios.post('https://bf2c-154-111-224-232.ngrok-free.app/translate', payload);

      console.log('Translation microservice response:', response.data); // pour debug

      if (response.data?.translations?.[0]) {
        return response.data.translations[0];  
      }

      throw new InternalServerErrorException('Invalid response from translation service');
    } catch (error) {
      console.error('Error while translating text:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Error while translating text');
    }
  }
}