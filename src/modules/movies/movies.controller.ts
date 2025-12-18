import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  UploadedFiles,
  Query,
  Req,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { MovieQueryDto } from './dto/movie.query.dto';
import { CreateReview } from './dto/create-review.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post(':movieId/reviews')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  createReview(
    @Body() payload: CreateReview,
    @Req() req,
    @Param('movieId', ParseUUIDPipe) movieId: string,
  ) {
    const userId = req.user.id;
    return this.moviesService.createReview(payload, userId, movieId);
  }

  @Post('admin')
  @ApiOperation({ summary: 'Movie qoshish admin orqali' })
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Post('admin/upload-assets/:id')
  @ApiOperation({ summary: 'Moviega video va poster qoshish admin orqali' })
  @ApiOperation({ summary: 'Kino videosi va posterini yuklash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video fayli (mp4, mkv)',
        },
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Poster rasmi (jpg, png)',
        },
      },
      required: ['video', 'poster'],
    },
  })
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder =
              file.fieldname === 'video'
                ? './uploads/movies/videos'
                : './uploads/movies/posters';
            cb(null, folder);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
            );
          },
        }),
      },
    ),
  )
  uploadAssets(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; poster?: Express.Multer.File[] },
  ) {
    const videoPath = files.video?.[0]?.path;
    const posterPath = files.poster?.[0]?.path;

    return this.moviesService.updateMovieFiles(id, { videoPath, posterPath });
  }

  @Get()
  @ApiOperation({
    summary: 'Barcha kinolarni filtrlash va pagination bilan olish',
  })
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli royxat qaytarildi.',
  })
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findAll(@Query() query: MovieQueryDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':slug')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli kirildi.',
  })
  @ApiResponse({
    status: 403,
    description: 'Siz bu kinoni korish huquqiga ega emasssiz.',
  })
  findOne(@Param('slug') slug: string, @Req() req) {
    const userId = req.user.id;
    return this.moviesService.findOne(slug, userId);
  }

  @Patch(':id')
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, payload);
  }

  @Delete(':movieId/reviews/:reviewId')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  deleteReview(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.moviesService.deleteReview(movieId, reviewId, userId);
  }

  @Delete(':id')
  @ApiSecurity('cookie-auth-key')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
  }
}
