import { Module } from '@nestjs/common';
import { BusinessInfoModule } from './business-info/business-info.module';
import { CustomerInfoModule } from './customer-info/customer-info.module';
import { ProductInfoModule } from './product-info/product-info.module';
import { BomInfoModule } from './bom-info/bom-info.module';
import { ProcessInfoModule } from './process-info/process-info.module';
@Module({
  imports: [BusinessInfoModule, CustomerInfoModule, ProductInfoModule, BomInfoModule, ProcessInfoModule],
  exports: [BusinessInfoModule, CustomerInfoModule, ProductInfoModule, BomInfoModule, ProcessInfoModule],
})
export class BaseInfoModule {}
