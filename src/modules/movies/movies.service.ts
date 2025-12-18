import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';
import { MovieQueryDto } from './dto/movie.query.dto';
import { CreateReview } from './dto/create-review.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateMovieDto) {
    const { categoryIds, ...MovieData } = payload;
    const slug = payload.title.toLowerCase().split(' ').join('-') + '-' + Math.floor(Math.random() * 900) + 100
    const movie = await this.prisma.movies.create({
      data: {
        ...MovieData,
        slug,
        videoUrl: '',
        posterUrl: '',
        movieCategories: {
          create: categoryIds?.map((id) => ({
            category: { connect: { id } },
          })),
        },
      },
      include: {
        movieCategories: true,
      },
    });

    return {
      success: true,
      message: "Kino ma'lumotlari qo'shildi. Endi faylni yuklang.",
      data: movie,
    };
  }

  async updateMovieFiles(
    id: string,
    paths: { videoPath?: string; posterPath?: string },
  ) {
    const movie = await this.prisma.movies.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Kino topilmadi');

    const updatedMovie = await this.prisma.movies.update({
      where: { id },
      data: {
        videoUrl: paths.videoPath
          ? `http://localhost:${process.env.PORT}/` + paths.videoPath
          : movie.videoUrl,
        posterUrl: paths.posterPath
          ? `http://localhost:${process.env.PORT}/` + paths.posterPath
          : movie.posterUrl,
      },
    });

    return {
      success: true,
      message: 'Fayllar muvaffaqiyatli yuklandi',
      data: updatedMovie,
    };
  }

  async findAll(query: MovieQueryDto) {
    const { search, category, subscription_type } = query;
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (subscription_type) {
      where.subscriptionType = subscription_type.toUpperCase();
    }

    if (category) {
      where.movieCategories = {
        some: {
          category: {
            name: { contains: category, mode: 'insensitive' },
          },
        },
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movies.findMany({
        where,
        skip,
        take: limit,
        include: {
          movieCategories: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.movies.count({ where }),
    ]);

    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      poster_url: movie.posterUrl,
      release_year: movie.release_year,
      rating: movie.rating,
      subscription_type: movie.subscriptionType.toLowerCase(),
      categories: movie.movieCategories.map((mc) => mc.category.name),
    }));

    return {
      success: true,
      data: {
        movies: formattedMovies,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(slug: string, userId: string) {
    try {
      const movie = await this.prisma.movies.findUnique({ where: { slug } });
      if (!movie) {
        throw new NotFoundException({ message: 'Bunday movie topilmadi' });
      }

      const user = await this.prisma.users.findUnique({
        where: { id: userId }
      });
      const activeSub = await this.prisma.userSubscription.findFirst({
        where: {
          userId: userId,
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
      if (!activeSub) {
        await this.prisma.userSubscription.updateMany({
          where: { userId: userId, status: 'active' },
          data: { status: 'expired' },
        });
        throw new ForbiddenException('Sizning obuna muddatingiz tugadi.');
      }

      if (movie.subscriptionType === "PREMIUM" && user?.role == "USER" && activeSub?.plan.name == "FREE") {
        return {
          success: false,
          message: "SIZDA PREMIUM KINOLARNI KORISH HUQUQI YO'Q"
        }
      }
      await this.prisma.movies.update({
        where: { slug },
        data: { viewCount: movie.viewCount + 1 },
      });
      return {
        success: true,
        message: 'Kino topildi',
        data: movie,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'Kinoni korishda xatolik yuz berdi',
      });
    }
  }

  async update(id: string, payload: UpdateMovieDto) {
    try {
      const movie = await this.prisma.movies.findUnique({ where: { id } });
      if (!movie) {
        throw new NotFoundException({ message: 'Bunday movie topilmadi' });
      }
      const updatedMovie = await this.prisma.movies.update({
        where: { id },
        data: payload,
      });
      return {
        success: true,
        message: 'Kino muvaffaqiyatli yangilandi',
        data: updatedMovie,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'Kino malumotlarini yangilashda xatolik yuz berdi',
      });
    }
  }

  async remove(id: string) {
    try {
      const movie = await this.prisma.movies.findUnique({ where: { id } });
       if (!movie) {
         throw new NotFoundException({ message: 'Bunday movie topilmadi' });
       }
      
      await this.prisma.movies.delete({ where: { id } });

      return {
        success: true,
        message: "Kino muvaffaqiyatli o'chirildi"
      }
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException({ message: "Kino delete qilishda xatolik" });
    }
  }

  async createReview(payload: CreateReview, userId: string, movieId: string) {
    try {
      const movieExist = await this.prisma.movies.findUnique({
        where: { id: movieId },
      });
      if (!movieExist) {
        throw new NotFoundException({ message: 'Bunday kino mavjud emas' });
      }
      const review = await this.prisma.review.create({
        data: {
          userId,
          ...payload,
          movieId,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Sharh muvaffaqiyatli qo'shildi",
        data: review,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        { message: 'Comment yozishda muammo' },
        error,
      );
    }
  }

  async deleteReview(movieId: string, reviewId: string, userId: string) {
    const movieExist = await this.prisma.movies.findUnique({
      where: { id: movieId },
    });
    if (!movieExist) {
      throw new NotFoundException({ message: 'Bunday kino mavjud emas' });
    }
    const reviewExist = await this.prisma.review.findUnique({
      where: { id: reviewId, userId, movieId },
    });

    if (!reviewExist) {
      throw new NotFoundException('Bunday comment topilmadi');
    }

    await this.prisma.review.delete({
      where: { id: reviewId, userId, movieId },
    });

    return {
      success: true,
      message: "Sharh muvaffaqiyatli o'chirildi",
    };
  }
}
