import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/auth.module';
import { MoviesModule } from './modules/movies/movies.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prima.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [UsersModule, MoviesModule, ProfileModule, CategoriesModule,
    ConfigModule.forRoot({
      isGlobal : true
  }),
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) : Promise<JwtModuleOptions> => ({
        secret: configService.get<string>('JWT_SECRET') as string, 
        signOptions: { 
          expiresIn:  configService.get('JWT_EXPIRATION_TIME', '1h') ,
        },
      }),
      inject: [ConfigService], 
    }),
    SubscriptionPlanModule,
    FavoritesModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
