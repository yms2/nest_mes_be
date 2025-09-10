import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderManagement } from './entities/ordermanagement.entity';
import { EstimateManagement } from '../estimatemanagement-info/entities/estimatemanagement.entity';
import { CustomerInfo } from '../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../base-info/product-info/product_sample/entities/product-info.entity';
import * as controllers from './controllers';
import * as services from './services';

import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderManagement, EstimateManagement, CustomerInfo, ProductInfo]),
        CommonModule,
        LogModule,
    ],
    controllers: controllerArray,
    providers: serviceArray,
    exports: serviceArray,
})
export class OrderManagementModule {}