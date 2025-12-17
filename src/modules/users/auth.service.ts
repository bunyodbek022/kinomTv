import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { addDays, format } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(payload: RegisterDto) {
    try {
      const existingUser = await this.prisma.users.findFirst({
        where: {
          OR: [{ username: payload.username }, { email: payload.email }],
        },
      });

      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const user = await this.prisma.users.create({
        data: {
          username: payload.username,
          email: payload.email,
          password: hashedPassword,
          awatarUrl: payload.awatarUrl,
        },
      });
      const freePlan = await this.prisma.subscriptionPlan.findFirst({
        where: { name: 'FREE' },
      });
      if (!freePlan) {
        return {
          success: false,
          message: 'Bizda hali free plan mavjud emas',
        };
      }
      const end = addDays(new Date(), 30);
      const subscription = await this.prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: freePlan?.id,
          endDate: end,
          status: 'active',
        },
      });
      return {
        success: true,
        message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
        data: {
          user_id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          subscriptionPlan: freePlan.name,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User register qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async login(payload: LoginDto, res: Response) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { username: payload.username },
      });

      if (!user) {
        throw new NotFoundException('User topilmadi');
      }
      console.log(user);
      const isMatch = await bcrypt.compare(payload.password, user.password);

      if (!isMatch) {
        return {
          success: false,
          message: 'Username yoki parolda xatolik',
        };
      }

      const token = this.jwtService.sign({
        id: user.id,
        role: user.role,
      });

      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
      const isProduction = process.env.NODE_ENV === 'production';

      const activeSub = await this.prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'active',
          endDate: {
            gt: new Date(),
          },
        },
        orderBy: {
          endDate: 'desc',
        },
        include: { plan: true },
      });

      if (!activeSub && !isAdmin) {
        await this.prisma.userSubscription.updateMany({
          where: { userId: user.id, status: 'active' },
          data: { status: 'expired' },
        });
        throw new ForbiddenException('Sizning obuna muddatingiz tugadi.');
      }
      
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60,
      });

      const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';

      if (!activeSub?.endDate) {
        throw new NotFoundException("Subscriptionni tugash vaqti yo'q");
      }
      res.send({
      success: true,
      message: 'Muvaffaqqiyatli kirildi',
      data: {
        user_id: user.id,
        username: user.username,
        role: user.role,
        subscription: isAdmin ? 'LIFETIME' : (activeSub?.plan?.name || 'FREE'),
        startSubDate: activeSub ? format(activeSub.startDate, DATE_TIME_FORMAT) : null,
        endSubDate: activeSub ? format(activeSub.endDate, DATE_TIME_FORMAT) : "UNLIMITED",
      },
    });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException({
        message: 'User login qilishda xatolik yuz berdi ',
        error,
      });
    }
  }
  async findAll() {
    try {
      const users = await this.prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          awatarUrl: true,
          createdAt: true,
        },
      });
      return {
        success: true,
        message: "Hamma userlar ro'yxati",
        data: users,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'Userlar malumotlarni  olishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          awatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Bunday user topilmadi',
        };
      }
      const activeSub = await this.prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'active',
          endDate: {
            gt: new Date(),
          },
        },
        orderBy: {
          endDate: 'desc',
        },
        take: 1,
      });
      return {
        success: true,
        data: { ...user, subStatus: activeSub?.status || null },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User malumotlarni  olishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async update(id: string, payload: UpdateUserDto) {
    try {
      const userExist = await this.findOne(id);
      if ((userExist.success = false)) {
        return {
          success: false,
          message: 'User topilmadi',
        };
      }

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: payload,
      });
      return {
        success: true,
        message: 'User malumotlari yangilandi',
        data: updatedUser,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'User malumotlarni  update qilishda xatolik yuz berdi ',
        error,
      });
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.users.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: "Useni o'chirishda xatolik yuz berdi ",
        error,
      });
    }
  }

  async logout(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.send({ succcess: true, message: 'Muvaffaqiyatli tizimdan chiqildi' });
  }
}
