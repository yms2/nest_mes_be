import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessInfo } from './entities/business-info.entity';
import {
  BusinessInfoCreateService,
  BusinessInfoReadService,
  BusinessInfoSearchService,
  BusinessInfoUpdateService,
  BusinessInfoDeleteService,
  BusinessUploadService,
  BusinessUploadValidationService,
  BusinessUploadProcessingService,
  BusinessUploadSessionService,
} from './services';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

import { LogModule } from '../../log/log.module';
import {
  BusinessInfoController,
  BusinessInfoCreateController,
  BusinessInfoUpdateController,
  BusinessInfoDeleteController,
  BusinessUploadController,
} from './controllers';
import { BusinessInfoHandler } from './handlers/business-info.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfo]),
    LogModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [
    BusinessInfoController,
    BusinessInfoCreateController,
    BusinessInfoUpdateController,
    BusinessInfoDeleteController,
    BusinessUploadController,
  ],
  providers: [
    BusinessInfoHandler,
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
    BusinessUploadService,
    BusinessUploadValidationService,
    BusinessUploadProcessingService,
    BusinessUploadSessionService,
  ],
  exports: [
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
    BusinessUploadService,
  ],
})
export class BusinessInfoModule {}
