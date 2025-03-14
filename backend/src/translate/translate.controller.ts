import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TranslationService } from './translate.service';


@Controller('translate')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async translate(@Body() body: { text: string; srcLang: string; tgtLang: string }) {
    const { text, srcLang, tgtLang } = body;
    


    if (!text || !srcLang || !tgtLang) {
      throw new BadRequestException('Invalid input');
    }

    try {
      const translatedText = await this.translationService.translate(text, srcLang, tgtLang);
      return { translation: translatedText };
    } catch (error) {
      throw new BadRequestException(`Translation failed: ${error.message}`);
    }
  }
}
