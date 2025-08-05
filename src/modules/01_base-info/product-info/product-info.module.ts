import { LogModule } from 'src/modules/log/log.module';
import { ProductInfoHandler } from './product_sample/handlers/product-info.handler';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductInfo } from './product_sample/entities/product-info.entity';
import { ProductFile } from './product_sample/entities/product-file.entity';
import { CustomerInfo } from '../customer-info/entities/customer-info.entity';
import {
  ProductInfoReadController,
  ProductInfoCreateController,
  ProductInfoUpdateController,
  ProductInfoDeleteController,
  ProductInfoQrCodeController,
  ProductInfoExcelController,
  ProductFileController,
} from './product_sample/controllers';
import {
  ProductInfoSearchService,
  ProductInfoReadService,
  ProductInfoCreateService,
  ProductInfoUpdateService,
  ProductInfoDeleteService,
  ProductInfoQrCodeService,
  ProductInfoTemplateService,
  ProductFileService,
} from './product_sample/services';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CommonModule, 
    LogModule, 
    TypeOrmModule.forFeature([ProductInfo, ProductFile, CustomerInfo])],
  controllers: [
    ProductInfoReadController,
    ProductInfoCreateController,
    ProductInfoUpdateController,
    ProductInfoDeleteController,
    ProductInfoQrCodeController,
    ProductInfoExcelController,
    ProductFileController,
  ],
  providers: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoCreateService,
    ProductInfoUpdateService,
    ProductInfoDeleteService,
    ProductInfoQrCodeService,
    ProductInfoHandler,
    ProductInfoTemplateService,
    ProductFileService,
  ],
  exports: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoCreateService,
    ProductInfoUpdateService,
    ProductInfoDeleteService,
    ProductInfoQrCodeService,
    ProductInfoTemplateService,
    ProductFileService,
  ],
})
export class ProductInfoModule {}
