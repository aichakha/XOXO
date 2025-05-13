import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TranslationService } from './translate.service';


@Controller('translate')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async translate(@Body() body: { text: string; srcLang: string; tgtLang: string }) {
    const { text, srcLang, tgtLang } = body;
    

    console.log('Requête reçue:', body);

    if (!text || !srcLang || !tgtLang) {
      throw new BadRequestException('Invalid input');
    }

      // Si la langue source est "auto", on détecte la langue
      let detectedSrcLang = srcLang.toLowerCase() === 'auto' ? await this.translationService.detectLanguage(text) : srcLang.toLowerCase();
          
      // Traduction du texte
      try {
        let translatedText = text;

        // Étape 1 : Si la langue source n'est pas l'anglais, traduire vers l'anglais
        if (detectedSrcLang !== 'en') {
          translatedText = await this.translationService.translate(text, detectedSrcLang, 'en');
        }

        // Étape 2 : Si la langue cible n'est pas l'anglais, traduire de l'anglais vers la langue cible
        if (tgtLang.toLowerCase() !== 'en') {
          translatedText = await this.translationService.translate(translatedText, 'en', tgtLang.toLowerCase());
        }

        return {
          translation: translatedText,
          detectedSourceLang: detectedSrcLang,
          targetLang: tgtLang.toLowerCase(),
        };
      } catch (error) {
        console.error('Error while translating text:', error.response?.data || error.message);
        throw new BadRequestException(`Translation failed: ${error.message}`);
      }
    }
}