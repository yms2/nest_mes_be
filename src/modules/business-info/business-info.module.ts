import { Module } from '@nestjs/common';
import { EstimateManagementModule } from './estimatemanagement-info/estimatemanagement.module';
import { OrderManagementModule } from './ordermanagement-info/ordermanagement.module';

@Module({
    imports: [EstimateManagementModule, OrderManagementModule],
    exports: [EstimateManagementModule, OrderManagementModule],
})
export class BusinessInfoModule {}