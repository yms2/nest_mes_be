import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { OrderManagement } from '../ordermanagement-info/entities/ordermanagement.entity';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { ShippingCreationHandler } from './handlers/shipping-creation.handler';
import * as controllers from './controllers';
import * as services from './services';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([Shipping, OrderManagement]),
        CommonModule,
        LogModule,
    ],
    controllers: controllerArray,
    providers: [...serviceArray, ShippingCreationHandler],
    exports: [...serviceArray],   
})
export class ShippingModule {}
