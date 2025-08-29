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
  BomProcessCreateController,
  BomProcessDeleteController,
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
  BomProcessCreateService,
  BomProcessDeleteService,
} from './services';
import { Module } from '@nestjs/common';
import { ProductInfo } from '../product-info/product_sample/entities/product-info.entity';
import { BomInfo } from './entities/bom-info.entity';
import { BomProcess } from './entities/bom-process.entity';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo, BomInfo, BomProcess]), // BomInfo 추가!
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
    BomProcessCreateController,
    BomProcessDeleteController,
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
    BomProcessCreateService,
    BomProcessDeleteService,
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
    BomProcessCreateService,
    BomProcessDeleteService,
  ],
})
export class BomInfoModule {}
