import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Req() req) {
    const userId = req.user.id;
    return this.favoritesService.create(createFavoriteDto, userId);
  }

  @Get()
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findAll(@Req() req) {
    const userId = req.user.id;
    return this.favoritesService.findAll(userId);
  }

  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }
}
