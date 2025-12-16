import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const username = await this.prisma.users.findUnique({ where: { username: payload.username } });
      if (!username) {
        return {
          success: false,
          message: "User aready exists"
        };
      };
      const email = await this.prisma.users.findUnique({ where: { email: payload.email } });
      if (!email) {
        return {
          success: false,
          message: "User aready exists"
        };
      };

      const user = await this.prisma.users.create({
        data: {
          username: payload.username,
          email: payload.email,
          password: hashedPassword,
          awatarUrl: payload.awatarUrl
        },
      });

      return {
        success: true,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User register qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async login(payload: LoginDto) {
    try {
      const user = await this.prisma.users.findUnique({ where: { username: payload.username } });
      if (!user) {
        return {
          success: false,
          messsage: "User not found"
        }
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User login qilishda xatolik yuz berdi ',
        error,
      });
    }
  }
  async findAll() {
    try {
      const users = await this.prisma.users.findMany();
      return {
        success: true,
        message: "Hamma userlar ro'yxati",
        data: users
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'Userlar malumotlarni  olishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async findOne(id: number) {
    try {
      return `This action returns a #${id} user`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User malumotlarni  olishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return `This action updates a #${id} user`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User malumotlarni  update qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async remove(id: number) {
    try {
      return `This action removes a #${id} user`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: "Useni o'chirishda xatolik yuz berdi ",
        error,
      });
    }
  }
}
