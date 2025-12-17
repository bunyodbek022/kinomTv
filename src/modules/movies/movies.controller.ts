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
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Post('upload-assets/:id')
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
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.moviesService.findOne(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}
