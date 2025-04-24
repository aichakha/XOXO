import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
  Put,Query ,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { SavedTextService } from './saved-text.service';
import { CreateSavedTextDto } from './dto/create-saved-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateClipDto } from './dto/update-clip.dto';
import { FavoriteClipDto } from './dto/favorite-clip.dto';
import { tagclipDto } from './dto/Tag-clip.dto';

@Controller('saved-text')
export class SavedTextController {

  constructor(private savedTextService: SavedTextService) {}

  // 🟢 CREATE
  @UseGuards(JwtAuthGuard)
  @Post()
  async saveText(@Body() createSavedTextDto: CreateSavedTextDto) {
    return this.savedTextService.saveText(
      createSavedTextDto.userId,
      createSavedTextDto.content,
      createSavedTextDto.title
    );
  }


  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorites')
  async getFavorites(@Param('userId') userId: string) {
    return this.savedTextService.getFavorites(userId);
  }

  // 🟢 READ BY USER
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getSavedTexts(@Param('userId') userId: string) {
    return this.savedTextService.getSavedTexts(userId);
  }

  // 🔴 DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSavedText(@Param('id') id: string) {
    return this.savedTextService.deleteSavedText(id);
  }

  // 🔵 UPDATE
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClipDto: UpdateClipDto
  ) {
    try {
      return await this.savedTextService.updateSavedText(id, updateClipDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }



  @UseGuards(JwtAuthGuard)
  @Patch(':id/favorite')
  async toggleFavorite(
    @Param('id') id: string,
    @Body() favoriteDto: FavoriteClipDto
  ) {
    return this.savedTextService.toggleFavorite(id, favoriteDto.isFavorite);
  }

  // 🟣 CATEGORY MANAGEMENT
  @UseGuards(JwtAuthGuard)
  @Put(':id/assign-category/:categoryId')
  assignCategory(
    @Param('id') textId: string,
    @Param('categoryId') categoryId: string
  ) {
    return this.savedTextService.assignCategoryToText(textId, categoryId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/remove-category')
  removeCategory(@Param('id') textId: string) {
    return this.savedTextService.removeCategoryFromText(textId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/change-category/:newCategoryId')
  changeCategory(
    @Param('id') textId: string,
    @Param('newCategoryId') newCategoryId: string
  ) {
    return this.savedTextService.changeCategory(textId, newCategoryId);
  }
    // ✅ PATCH /saved-text/pin/:id
  @UseGuards(JwtAuthGuard)
  @Patch('pin/:id')
  togglePin(@Param('id') id: string, @Body() dto: tagclipDto) {
    return this.savedTextService.togglePinText(id, dto);
  }

  // 📌 GET /saved-text/pinned/:userId
  @UseGuards(JwtAuthGuard)
  @Get('pinned/:userId')
  async getPinned(@Param('userId') userId: string) {
    return await this.savedTextService.getPinned(userId);

  }

  // 📌 GET /saved-text/unpinned/:userId
  @UseGuards(JwtAuthGuard)
  @Get('unpinned/:userId')
  async getUnpinned(@Param('userId') userId: string) {
    return this.savedTextService.getUnpinned(userId);
  }

  @Get('by-user/:userId')
getByUser(@Param('userId') userId: string) {
  return this.savedTextService.getAllTextsByUser(userId);
}

}
