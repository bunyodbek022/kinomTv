import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() payload: CreateCategoryDto) {
    return this.categoriesService.create(payload);
  }

  @Get()
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
