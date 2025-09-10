import { Module } from '@nestjs/common';
import { EstimateManagementModule } from './estimatemanagement-info/estimatemanagement.module';
import { OrderManagementModule } from './ordermanagement-info/ordermanagement.module';
import { ShippingModule } from './shipping-info/shipping.module';

@Module({
    imports: [EstimateManagementModule, OrderManagementModule, ShippingModule],
    exports: [EstimateManagementModule, OrderManagementModule, ShippingModule],
})
export class BusinessInfoModule {}