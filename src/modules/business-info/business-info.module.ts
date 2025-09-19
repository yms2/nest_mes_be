import { Module } from '@nestjs/common';
import { EstimateManagementModule } from './estimatemanagement-info/estimatemanagement.module';
import { OrderManagementModule } from './ordermanagement-info/ordermanagement.module';
import { OrderInfoModule } from './order-info/order-info.module';
import { ShippingModule } from './shipping-info/shipping.module';
import { ReceivingManagementModule } from './receiving-management/receiving-management.module';
import { DeliveryModule } from './delivery-management-info/delivery.module';

@Module({
    imports: [
        EstimateManagementModule, 
        OrderManagementModule, 
        OrderInfoModule, 
        ShippingModule, 
        ReceivingManagementModule, 
        DeliveryModule,
    ],
    exports: [
        EstimateManagementModule, 
        OrderManagementModule, 
        OrderInfoModule, 
        ShippingModule, 
        ReceivingManagementModule, 
        DeliveryModule,
    ],
})
export class BusinessInfoModule {}