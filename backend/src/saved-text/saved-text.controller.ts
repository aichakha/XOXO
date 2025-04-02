import { Body, Controller, Post, Get, Param, Delete } from '@nestjs/common';
import { SavedTextService } from './saved-text.service';
import { CreateSavedTextDto } from './dto/create-saved-text.dto';


@Controller('saved-text')
export class SavedTextController {
  constructor(private savedTextService: SavedTextService) {}

  @Post()
  async saveText(@Body() createSavedTextDto: CreateSavedTextDto) {
    return this.savedTextService.saveText(createSavedTextDto.userId, createSavedTextDto.content);
  }

  @Get(':userId')
  async getSavedTexts(@Param('userId') userId: string) {
    return this.savedTextService.getSavedTexts(userId);
  }

  @Delete(':id')
  async deleteSavedText(@Param('id') id: string) {
    return this.savedTextService.deleteSavedText(id);
  }
}