import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MoviesModule } from './modules/movies/movies.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MovieFilesModule } from './modules/movie-files/movie-files.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prima.module';

@Module({
  imports: [UsersModule, MoviesModule, ProfileModule, MovieFilesModule, CategoriesModule, ConfigModule.forRoot({
      isGlobal : true
  }),
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
