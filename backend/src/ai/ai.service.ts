import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AIService {
  async transcribeAudio(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const whisperPath = 'whisper'; // Assurez-vous que Whisper est installé et accessible
      const args = ["test.mp3", '--model', 'base'];

      const process = spawn(whisperPath, args);

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        console.error(`Erreur Whisper: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Whisper a échoué avec le code ${code}`));
        }
      });
    });
  }
}
