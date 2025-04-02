import { Body, Controller, Post, Get, Param, Delete, UseGuards ,Patch,Put } from '@nestjs/common';
import { SavedTextService } from './saved-text.service';
import { CreateSavedTextDto } from './dto/create-saved-text.dto';
import { AuthGuard } from '../auth/jwt-auth.guard';
import { UpdateClipDto } from './dto/update-clip.dto';

@Controller('saved-text')
export class SavedTextController {
  constructor(private savedTextService: SavedTextService) {}

  @UseGuards(AuthGuard) 
  @Post()
  async saveText(@Body() createSavedTextDto: CreateSavedTextDto) {
    return this.savedTextService.saveText(
      createSavedTextDto.userId,
      createSavedTextDto.content,
      createSavedTextDto.title // On passe le titre s'il est fourni
    );
  }

  @UseGuards(AuthGuard) 
  @Get(':userId')
  async getSavedTexts(@Param('userId') userId: string) {
    return this.savedTextService.getSavedTexts(userId);
  }

  @UseGuards(AuthGuard) 
  @Delete(':id')
  async deleteSavedText(@Param('id') id: string) {
    return this.savedTextService.deleteSavedText(id);
  }
  @UseGuards(AuthGuard) 
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClipDto: UpdateClipDto,
  ) {
    return this.savedTextService.updateSavedText(id, updateClipDto);
  }

}