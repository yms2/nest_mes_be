import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Shipping } from '../shipping-info/entities/shipping.entity';
import { CustomerInfo } from '../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../base-info/product-info/product_sample/entities/product-info.entity';
import { OrderManagement } from '../ordermanagement-info/entities/ordermanagement.entity';
import { LogModule } from 'src/modules/log/log.module';
import { InventoryManagementModule } from '@/modules/inventory/inventory-management/inventory-management.module';
import * as controllers from './controllers';
import * as services from './services';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);


@Module({
    imports: [
        TypeOrmModule.forFeature([Delivery, Shipping, CustomerInfo, ProductInfo, OrderManagement]),
        LogModule,
        InventoryManagementModule,
    ],
    controllers: [...controllerArray],
    providers: [...serviceArray],
    exports: [...serviceArray],
})
export class DeliveryModule {}
