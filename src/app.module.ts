import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NoticeModule } from './notice/notice.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import { QnaController } from './qna/qna.controller';
import { QnaService } from './qna/qna.service';
import { QnaModule } from './qna/qna.module';
import { SampleModule } from './sample/sample.module';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { RegisterModule } from './register/register.module';
@Module({
  imports: [
    NoticeModule,
    QnaModule,
    SampleModule,
    UserModule,
    AuthModule,
    RegisterModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [path.join(__dirname, '/**/*.entity.{ts,js}')],
        synchronize: true, // 개발 환경에서 자동으로 DB 스키마를 동기화
      }),
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
