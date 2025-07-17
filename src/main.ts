import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const configService = new ConfigService();
  const useHttps = configService.get<boolean>('USE_HTTPS') || false;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  let app: NestExpressApplication;

  if (useHttps && nodeEnv === 'production') {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
  }

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 값 제거
      forbidNonWhitelisted: true, // DTO에 없는 값이 오면 에러 발생
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  // ✅ Swagger 설정 추가 시작
  const config = new DocumentBuilder()
    .setTitle('Covonics API 문서')
    .setDescription(
      `Covonics API Swagger 문서\n\n📅 최근 업데이트: ${new Date().toISOString().slice(0, 10)}`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .build();

  app.use(cookieParser()); // ✅ 필수
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // ✅ Swagger 설정 추가 끝
  await app.listen(configService.get('PORT', 5000));
}

void bootstrap();
