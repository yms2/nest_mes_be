import { Module } from '@nestjs/common';
import { BusinessInfoModule } from './business-info/business-info.module';
import { CustomerInfoModule } from './customer-info/customer-info.module';
import { ProductInfoModule } from './product-info/product-info.module';
import { BomInfoModule } from './bom-info/bom-info.module';
import { ProcessInfoModule } from './process-info/process-info.module';
import { EmployeeInfoModule } from './employee-info/employee-info.module';
import { PermissionInfoModule } from './permission-info/permission-info.module';  
import { SettingInfoModule } from './setting-info/setting-info.module';
import { ProcessEquipmentModule } from './process-equipment/process-equipment.module';

@Module({
  imports: [BusinessInfoModule, CustomerInfoModule, ProductInfoModule, BomInfoModule, ProcessInfoModule, EmployeeInfoModule, PermissionInfoModule, SettingInfoModule, ProcessEquipmentModule],
  exports: [BusinessInfoModule, CustomerInfoModule, ProductInfoModule, BomInfoModule, ProcessInfoModule, EmployeeInfoModule, PermissionInfoModule, SettingInfoModule, ProcessEquipmentModule],
})
export class BaseInfoModule {}
