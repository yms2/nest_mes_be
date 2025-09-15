import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Shipping } from '../shipping-info/entities/shipping.entity';
import { LogModule } from 'src/modules/log/log.module';
import * as controllers from './controllers';
import * as services from './services';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);


@Module({
    imports: [
        TypeOrmModule.forFeature([Delivery, Shipping]),
        LogModule,
    ],
    controllers: [...controllerArray],
    providers: [...serviceArray],
    exports: [...serviceArray],
})
export class DeliveryModule {}
