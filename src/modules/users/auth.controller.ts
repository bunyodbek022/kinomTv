import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
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
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  // @ApiSecurity('cookie-auth-key')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  @ApiSecurity('cookie-auth-key')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Delete()
  logout() {}
}
