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
  ExcelTemplateService,
  ExcelExportService
} from './services';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

import { LogModule } from '../../log/log.module';
import {
  BusinessInfoController,
  BusinessInfoCreateController,
  BusinessInfoUpdateController,
  BusinessInfoDeleteController,
  BusinessUploadController,
  BusinessExcelController
} from './controllers';
import { BusinessInfoHandler } from './handlers/business-info.handler';
import { BusinessBankModule } from './business-bank/business-bank.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfo]),
    LogModule,
    BusinessBankModule,
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
    BusinessExcelController
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
    ExcelTemplateService,
    ExcelExportService
  ],
  exports: [
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
    BusinessUploadService,
    ExcelTemplateService,
    ExcelExportService
  ],
})
export class BusinessInfoModule {}
