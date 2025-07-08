import { Module } from '@nestjs/common';
import { BusinessInfoModule } from './business-info/business-info.module';
import { CustomerInfoModule } from './customer-info/customer-info.module';

@Module({
  imports: [
    BusinessInfoModule,
    CustomerInfoModule,
  ],
  exports: [
    BusinessInfoModule,
    CustomerInfoModule,
  ],
})
export class BaseInfoModule {}