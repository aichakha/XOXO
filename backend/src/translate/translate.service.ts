import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslationService {
  translate(text: string, srcLang: string, tgtLang: string) {
    throw new Error('Method not implemented.');
  }
  async translateText(text: string, srcLang: string, tgtLang: string): Promise<string> {
    try {
      const response = await axios.post('https://7424-196-203-24-105.ngrok-free.app/translate', {
        text,
        src_lang: srcLang,
        tgt_lang: tgtLang,
      });

      if (response.data && response.data.translation) {
        return response.data.translation;
      }

      throw new InternalServerErrorException('Invalid response from translation service');
    } catch (error) {
      console.error('Error while translating text:', error);
      throw new InternalServerErrorException('Error while translating text');
    }
  }
}
