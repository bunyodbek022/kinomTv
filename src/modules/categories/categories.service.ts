import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService){}
  async create(payload: CreateCategoryDto) {
    try {
      const category = await this.prisma.categories.findFirst({ where: { name: payload.name } });

      if (category) {
        throw new ConflictException({ message: "Bu nomdagi allaqachon mavjud" });
      }

      const newCategory = await this.prisma.categories.create({ data: payload })
      
      return {
        success: true,
        data: newCategory
      }
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({message: "categoriya yaratishda xatolik"})
    }
  }

  async findAll() {
    try {
      return  this.prisma.categories.findMany()
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({message: "categoriya yaratishda xatolik"})
    }
  }

  async findOne(id: string) {
    try {
      return `This action returns a #${id} category`;
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({message: "categoriya yaratishda xatolik"})
    }
  }

  async update(id: string, payload: UpdateCategoryDto) {
    try {
      return this.prisma.categories.update({ where: { id }, data: payload });
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({ message: "categoriya yaratishda xatolik" })
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.categories.delete({ where: { id } });
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({message: "categoriya yaratishda xatolik"})
    }
  }
}
