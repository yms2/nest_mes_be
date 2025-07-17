import { LogModule } from 'src/modules/log/log.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  BomExcelController,
  BomInfoUploadController,
  BomInfoDownloadController,
  BomCopyController,
  BomInfoController,
} from './controllers';
import {
  BomExcelService,
  BomInfoUploadService,
  BomInfoExcelDownloadService,
  BomCopyService,
  BomInfoService,
} from './services';
import { Module } from '@nestjs/common';
import { ProductInfo } from '../product-info/entities/product-info.entity';
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
  ],
  providers: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService,
    BomInfoService,
  ],
  exports: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService,
    BomInfoService,
  ],
})
export class BomInfoModule {}
