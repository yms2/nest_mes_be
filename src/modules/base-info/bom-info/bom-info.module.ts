import { LogModule } from "src/modules/log/log.module";
import { CommonModule } from "src/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BomExcelController, BomInfoUploadController,BomInfoDownloadController,BomCopyController } from "./controllers";
import { BomExcelService, BomInfoUploadService,BomInfoExcelDownloadService,BomCopyService } from "./services";
import { Module } from "@nestjs/common";
import { ProductInfo } from "../product-info/entities/product-info.entity";
import { BomInfo } from "./entities/bom-info.entity"; 

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo, BomInfo])  // BomInfo 추가!
  ],
  controllers: [
    BomExcelController,
    BomInfoUploadController,
    BomInfoDownloadController,
    BomCopyController
  ],
  providers: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService
  ],
  exports: [
    BomExcelService,
    BomInfoUploadService,
    BomInfoExcelDownloadService,
    BomCopyService
  ],
})
export class BomInfoModule {}
