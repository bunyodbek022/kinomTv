import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateMovieDto) {
    const slug =
      payload.title.toLowerCase().split(' ').join('-') +
      '-' +
      String(Math.floor(Math.random() * 900) + 100);
    const movie = await this.prisma.movies.create({
      data: {
        ...payload,
        slug,
        videoUrl : "",
        posterUrl: payload.posterUrl || '',
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
        videoUrl: paths.videoPath ? paths.videoPath : movie.videoUrl,
        posterUrl: paths.posterPath ? paths.posterPath : movie.posterUrl,
      },
    });

    return {
      success: true,
      message: 'Fayllar muvaffaqiyatli yuklandi',
      data: updatedMovie,
    };
  }

  findAll() {
    return this.prisma.movies.findMany();
  }

  async findOne(slug: string) {
    const movie = await this.prisma.movies.findUnique({ where: { slug } });
    if (!movie) {
      throw new NotFoundException({ message: 'Bunday movie topilmadi' });
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
  }

  update(id: number, payload: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
