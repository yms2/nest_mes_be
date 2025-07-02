import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const configService = new ConfigService();
  const useHttps = configService.get<boolean>('USE_HTTPS') || false;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  let app: NestExpressApplication;

  if (useHttps && nodeEnv === 'production') {
    const httpsOptions = {
      key: fs.readFileSync(configService.get('SSL_KEY_PATH') || ''),
      cert: fs.readFileSync(configService.get('SSL_CERT_PATH') || ''),
    };

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      httpsOptions,
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
      transform: true,
    }),
  );

  // ✅ Swagger 설정 추가 시작
  const config = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription('NestJS API Swagger 문서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // ✅ Swagger 설정 추가 끝

  await app.listen(configService.get('PORT', 5000));
}

void bootstrap();
