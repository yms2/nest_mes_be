import { LogModule } from 'src/modules/log/log.module';
import { ProductInfoHandler } from './product_sample/handlers/product-info.handler';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductInfo } from './product_sample/entities/product-info.entity';
import { CustomerInfo } from '../customer-info/entities/customer-info.entity';
import {
  ProductInfoReadController,
  ProductInfoCreateController,
  ProductInfoUpdateController,
  ProductInfoDeleteController,
  ProductInfoQrCodeController,
  ProductInfoExcelController,
} from './product_sample/controllers';
import {
  ProductInfoSearchService,
  ProductInfoReadService,
  ProductInfoCreateService,
  ProductInfoUpdateService,
  ProductInfoDeleteService,
  ProductInfoQrCodeService,
  ProductInfoTemplateService,
} from './product_sample/services';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CommonModule, 
    LogModule, 
    TypeOrmModule.forFeature([ProductInfo, CustomerInfo])],
  controllers: [
    ProductInfoReadController,
    ProductInfoCreateController,
    ProductInfoUpdateController,
    ProductInfoDeleteController,
    ProductInfoQrCodeController,
    ProductInfoExcelController,
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
  ],
  exports: [
    ProductInfoSearchService,
    ProductInfoReadService,
    ProductInfoCreateService,
    ProductInfoUpdateService,
    ProductInfoDeleteService,
    ProductInfoQrCodeService,
    ProductInfoTemplateService,
  ],
})
export class ProductInfoModule {}
