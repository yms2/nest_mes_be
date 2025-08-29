import { LogModule } from 'src/modules/log/log.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  BomExcelController,
  BomInfoUploadController,
  BomInfoDownloadController,
  BomCopyController,
  BomInfoController,
  BomInfoCreateController,
  BomInfoUpdateController,
  BomInfoDeleteController,
} from './controllers';
import {
  BomExcelService,
  BomInfoUploadService,
  BomInfoExcelDownloadService,
  BomCopyService,
  BomInfoService,
  BomInfoCreateService,
  BomInfoUpdateService,
  BomInfoDeleteService,
} from './services';
import { Module } from '@nestjs/common';
import { ProductInfo } from '../product-info/product_sample/entities/product-info.entity';
import { BomInfo } from './entities/bom-info.entity';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo, BomInfo]), // BomInfo 추가!
  ],
  controllers: [
    BomExcelController,
    BomInfoUploadController,
    BomInfoDownloadController,
    BomCopyController,
    BomInfoController,
    BomInfoCreateController,
    BomInfoUpdateController,
    BomInfoDeleteController,
  ],
  providers: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService,
    BomInfoService,
    BomInfoCreateService,
    BomInfoUpdateService,
    BomInfoDeleteService,
  ],
  exports: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService,
    BomInfoService,
    BomInfoCreateService,
    BomInfoUpdateService,
    BomInfoDeleteService,
  ],
})
export class BomInfoModule {}
