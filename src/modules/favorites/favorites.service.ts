import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { da, tr } from 'date-fns/locale';
import { title } from 'process';
import { NotFoundError } from 'rxjs';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateFavoriteDto, userId) {
    try {
      const exist = await this.prisma.userFavorite.findFirst({
        where: { movieId: payload.movieId },
      });
      if (exist) {
        throw new ConflictException({ message: 'Bu movie favoritiesda bor' });
      }
      const favorite = await this.prisma.userFavorite.create({
        data: {
          ...payload,
          userId,
        },
        include: {
          movie: {
          select : {title :true}
        }} 
      });

      return {
        success: true,
        message: "Kino sevimlilar ro'yxatiga qo'shildi",
        data: { favorite },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        { message: 'Movieni Favoritiesga qoshishda xatolik' },
        error,
      );
    }
  }

  async findAll(userId) {
    try {
      const favorites = await this.prisma.users.findUnique({
        where: { id: userId }, select: {
          userFavorities: {
            select: {
              movie: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  posterUrl: true,
                  release_year: true,
                  rating: true,
                  subscriptionType: true
                }
              }
            }
          }
        }
      });
      const total = await this.prisma.userFavorite.count({ where: { userId: userId } });
      return {
        success: true, 
        data: {
          ...favorites,
          total
        }
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        { message: 'Favoritieslarni korishda xatolik' },
        error,
      );
    }
  }

  async remove(id: string) {
    try {
      const favorite = await this.prisma.userFavorite.findFirst({ where: { movieId: id } });
      if (!favorite) {
        throw new NotFoundException({ message: "Bu film favorite royxatidan topilmadi" });
      }
      const deletedMovie = await this.prisma.userFavorite.delete({ where: { id: favorite.id } });
      return {
        success: true,
        message: "Kino sevimlilar ro'yxatidan o'chirildi"
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        { message: 'Movieni Favoritiesdan ochirishda xatolik' },
        error,
      );
    }
  }
}
