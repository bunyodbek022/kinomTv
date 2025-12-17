import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import type { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchi yaratish' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Foydalanuvchi muvaffaqiyatli yaratildi.',
  })
  @ApiResponse({ status: 403, description: 'Taqiqlangan.' })
  create(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  login(@Body() payload: LoginDto, @Res() res: Response) {
    return this.authService.login(payload, res);
  }

  @Get()
  @ApiSecurity('cookie-auth-key')
  @Roles('SUPERADMIN', 'ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  @ApiSecurity('cookie-auth-key')
  @Roles('SUPERADMIN', 'ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req){
    const user = req.user;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
    if (!isAdmin && id !== String(user.id)) {
      throw new ForbiddenException(
        "Sizda boshqa foydalanuvchi ma'lumotlarini o'zgartirish huquqi yo'q"
      );
    }
    return this.authService.update(id, updateUserDto);
  }
  

  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  remove(@Param('id') id: string, @Req() req) {
    const user = req.user;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
    if (!isAdmin && id !== String(user.id)) {
      throw new ForbiddenException(
        "Sizda boshqa foydalanuvchi ma'lumotlarini o'chirish huquqi yo'q"
      );
    }
    return this.authService.remove(id);
  }

  @Post()
  @ApiOperation({ summary: 'Logout' })
  @ApiSecurity('cookie-auth-key')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
