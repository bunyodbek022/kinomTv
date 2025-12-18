import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true , transform: true, 
  transformOptions: {
    enableImplicitConversion: true, 
  },}),
  );
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Kinom-Tv')
    .setDescription(
      "Foydalanuvchilar kino ko'rish, sevimlilarga qo'shish va obuna bo'lish imkoniyatiga ega bo'lgan kinolar saytini yaratish. Admin va superadmin kinolarni boshqarishlari, yangi kontentlarni qo'shishlari mumkin.",
    )
    .setVersion('1.0')
    .addTag('api')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'accessToken',
        in: 'cookie',
      },
      'cookie-auth-key',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  const uploadsPath = join(process.cwd(), 'uploads');

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/', 
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
