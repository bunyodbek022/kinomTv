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
  ForbiddenException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Profile qoshish' })
  @ApiSecurity('cookie-auth-key')
  @ApiResponse({
    status: 201,
    description: 'Profile muvaffaqiyatli yaratildi.',
  })
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 403, description: 'Taqiqlangan.' })
  create(@Body() payload: CreateProfileDto, @Req() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new ForbiddenException({ message: 'Taqiqlangan' });
    }
    return this.profileService.create(payload, userId);
  }

  @Get()
  @ApiOperation({ summary: "Profileni ko'rish" })
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findOne(@Req() req) {
    const id = req.user.id;
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Profileni yangilash" })
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  update(@Req() req, @Body() payload: UpdateProfileDto) {
    const id = req.user.id;
    return this.profileService.update(id, payload);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.profileService.remove(id);
  // }
}
