import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderInfo } from './entities/order-info.entity';
import { OrderMain } from './entities/order-main.entity';
import { OrderManagement } from '../ordermanagement-info/entities/ordermanagement.entity';
import { BomInfo } from '../../base-info/bom-info/entities/bom-info.entity';
import { ProductInfo } from '../../base-info/product-info/product_sample/entities/product-info.entity';
import { Inventory } from '../../inventory/inventory-management/entities/inventory.entity';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { OrderInfoService } from './services/order-info.service';
import { OrderInfoController } from './controllers/order-info.controller';
import { OrderCreateService } from './services/order-create.service';

import * as services from './services';
import * as controllers from './controllers';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderInfo, OrderMain, OrderManagement, BomInfo, ProductInfo, Inventory]),
        CommonModule,
        LogModule,
    ],
    controllers: [OrderInfoController, ...controllerArray],
    providers: [OrderInfoService, OrderCreateService, ...serviceArray],
    exports: [OrderInfoService, OrderCreateService, ...serviceArray],
})
export class OrderInfoModule {}
