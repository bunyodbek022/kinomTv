import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService){}
  async create(payload: CreateProfileDto, userId: string) {
    try {
      const profile = await this.prisma.profile.create({
        data: {
          userId: userId,
          fullName: payload.fullName,
          phone: payload.phone,
          country: payload.country
        }
      });
      return {
        success: true,
        message: "Profile muvaffaqqiyatli yaratildi",
        data: profile
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({ message: "Profile yaratishda xatolik", error });
    }
  }


  async findOne(id: string) {
    try {
      const profile = await this.prisma.profile.findUnique({ where: { id } });
      return {
        success: true,
        data: profile
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({message: "Profileni ko'rishda xatolik"})
    }
  }

  async update(id: string, payload: UpdateProfileDto) {
    try {
      const updatedProfile = await this.prisma.profile.update({ where: { id }, data: payload });
      return {
        success: true,
        message: "Profil muvaffaqiyatli yangilandi",
        data: updatedProfile
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({message: "Profileni update qilishda xatolik"})
    }
  }

  // async remove(id: string) {
  //   try {
  //     return `This action removes a #${id} profile`;
      
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException({message: "Profileni o'chirishda xatolik"})
  //   }
  // }
}
