import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
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
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
