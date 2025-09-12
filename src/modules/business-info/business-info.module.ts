import { Module } from '@nestjs/common';
import { EstimateManagementModule } from './estimatemanagement-info/estimatemanagement.module';
import { OrderManagementModule } from './ordermanagement-info/ordermanagement.module';
import { OrderInfoModule } from './order-info/order-info.module';
import { ShippingModule } from './shipping-info/shipping.module';
import { ReceivingManagementModule } from './receiving-management/receiving-management.module';


@Module({
    imports: [EstimateManagementModule, OrderManagementModule, OrderInfoModule, ShippingModule, ReceivingManagementModule],
    exports: [EstimateManagementModule, OrderManagementModule, OrderInfoModule, ShippingModule, ReceivingManagementModule],
})
export class BusinessInfoModule {}