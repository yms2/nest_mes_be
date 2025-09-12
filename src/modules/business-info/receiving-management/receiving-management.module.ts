import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderInfo } from '../order-info/entities/order-info.entity';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import * as controllers from './controllers';
import * as services from './services';


const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderInfo]),
        CommonModule,
        LogModule,
    ],
    controllers: [...controllerArray],
    providers: [...serviceArray],
    exports: [...serviceArray],
})
export class ReceivingManagementModule {}
