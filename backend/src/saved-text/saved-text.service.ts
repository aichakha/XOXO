import { Injectable,NotFoundException  } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SavedTextService {
  constructor(private prisma: PrismaService) {}

  async saveText(userId: string, content: string) {
    try {
      return await this.prisma.savedText.create({
        data: { userId, content },
      });
    } catch (error) {
      throw new Error('Failed to save text: ' + error.message);
    }
  }

  async getSavedTexts(userId: string) {
    const texts = await this.prisma.savedText.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!texts || texts.length === 0) {
      throw new NotFoundException('No saved texts found for this user.');
    }

    return texts;
  }

  async deleteSavedText(id: string) {
    return this.prisma.savedText.delete({
      where: { id },
    });
  }
}