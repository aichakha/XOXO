import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SummarizeService {
  async summarizeText(text: string): Promise<string> {
    try {
      const response = await axios.post('http://localhost:8001/summarize', {
        text,
      });

      if (response.data && response.data.summary) {
        return response.data.summary;
      }

      throw new InternalServerErrorException('Invalid response from summarizer');
    } catch (error) {
      console.error('Error while summarizing text:', error);
      throw new InternalServerErrorException('Error while summarizing text');
    }
  }
}
