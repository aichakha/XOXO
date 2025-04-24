import { TestingModule } from '@nestjs/testing';
import { Injectable,NotFoundException  } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClipDto } from './dto/update-clip.dto';
import { tagclipDto } from './dto/Tag-clip.dto';


@Injectable()
export class SavedTextService {
  constructor(private prisma: PrismaService) {}

  async saveText(userId: string, content: string,title?: string) {
    try {
      const generatedTitle = title || content.split(" ").slice(0, 3).join(" "); // Prend les 3 premiers mots
      return await this.prisma.savedText.create({
        data: { userId, content,title: generatedTitle}
      });
    } catch (error) {
      throw new Error('Failed to save text: ' + error.message);
    }
  }

  /*async update(id: string, updateClipDto: UpdateClipDto) {
    // Vérifier si l'élément existe avant la mise à jour
    const existingText = await this.prisma.savedText.findUnique({ where: { id } });
  
    if (!existingText) {
      throw new NotFoundException(`Le texte avec l'ID ${id} n'existe pas.`);
    }
  
  // Mise à jour automatique des données
  const updatedText = await this.prisma.savedText.update({
    where: { id },
    data: {
      title: updateClipDto.title,
      content: updateClipDto.content,
    },
  });

  // Retourner l'élément mis à jour
  return updatedText;
}
  */
async updateSavedText(id: string, updateData: UpdateClipDto) {
  try {
    // Vérifier d'abord si le texte existe
    const existingText = await this.prisma.savedText.findUnique({
      where: { id }
    });

    if (!existingText) {
      throw new NotFoundException(`Text with ID ${id} not found`);
    }

    // Mettre à jour seulement les champs fournis
    const dataToUpdate: any = {};
    if (updateData.title !== undefined) {
      dataToUpdate.title = updateData.title;
    }
    if (updateData.content !== undefined) {
      dataToUpdate.content = updateData.content;
    }

    // Si aucun champ valide à mettre à jour
    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    return await this.prisma.savedText.update({
      where: { id },
      data: dataToUpdate,
    });
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new Error(`Failed to update saved text: ${error.message}`);
  }
}
 
  async getSavedTexts(userId: string) {
    console.log('📌 Getting saved texts for user:', userId); 
    const texts = await this.prisma.savedText.findMany({
      where: { userId  },
      orderBy: [
        { isPinned: 'desc' },     // 🔝 les textes épinglés en haut
        { createdAt: 'desc' }
      ],
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

  async toggleFavorite(id: string, isFavorite: boolean) {
    const text = await this.prisma.savedText.findUnique({ where: { id } });
  
    if (!text) {
      throw new NotFoundException('Text not found');
    }
  
    return this.prisma.savedText.update({
      where: { id },
      data: { isFavorite },
    });
  }

  async getFavorites(userId: string) {
    return this.prisma.savedText.findMany({
      where: { userId, isFavorite: true },
    });
  }
  
  // ✅ Associer à une catégorie
  async assignCategoryToText(textId: string, categoryId: string) {
    return this.prisma.savedText.update({
      where: { id: textId },
      data: { categoryId },
    });
  }

  // ✅ Supprimer la catégorie
  async removeCategoryFromText(textId: string) {
    return this.prisma.savedText.update({
      where: { id: textId },
      data: { categoryId: null },
    });
  }

  // ✅ Facultatif : changer de catégorie = assigner une autre
  async changeCategory(textId: string, newCategoryId: string) {
    return this.assignCategoryToText(textId, newCategoryId);
  } 
  
  // ✅ Épingler ou désépingler un texte
  async togglePinText(id: string, dto: tagclipDto) {
    return this.prisma.savedText.update({
      where: { id },
      data: { isPinned: dto.isPinned },
    });
  }

  // 📌 Récupérer tous les textes épinglés pour un utilisateur
async getPinned(userId: string) {
  console.log('Fetching pinned texts for user:', userId);
  const pinnedTexts = await this.prisma.savedText.findMany({
    where: { userId, isPinned: true },
  });
  console.log('Pinned texts:', pinnedTexts);
  return pinnedTexts;
}

  async getUnpinned(userId: string) {
    return this.prisma.savedText.findMany({ 
      where: { userId, isPinned: false },
    });
  }
  
  //get text by id
  async getAllTextsByUser(userId: string) {
  const results = await this.prisma.savedText.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!results || results.length === 0) {
    throw new NotFoundException(`this user has no texts ${userId}`);
  }

  return results;
}


}