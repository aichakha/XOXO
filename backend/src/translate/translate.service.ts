import { Injectable } from '@nestjs/common';
import { MarianMTModel, MarianTokenizer } from '@xenova/transformers';

@Injectable()
export class TranslationService {
  private model;
  private tokenizer;

  async initializeModel(srcLang: string, tgtLang: string) {
    const modelName = `Helsinki-NLP/opus-mt-${srcLang}-${tgtLang}`;
    this.tokenizer = await MarianTokenizer.from_pretrained(modelName);
    this.model = await MarianMTModel.from_pretrained(modelName);
  }

  async translate(text: string, srcLang: string, tgtLang: string): Promise<string> {
    if (!this.model || !this.tokenizer) {
      await this.initializeModel(srcLang, tgtLang);
    }

    const encodedText = await this.tokenizer(text, { return_tensors: 'pt', padding: true, truncation: true });
    const output = await this.model.generate(encodedText.input_ids);
    const translatedText = await this.tokenizer.decode(output[0], { skip_special_tokens: true });
    return translatedText;
  }
}