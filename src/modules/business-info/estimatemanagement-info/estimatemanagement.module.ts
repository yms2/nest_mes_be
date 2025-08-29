import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateManagement } from './entities/estimatemanagement.entity';
import * as controllers from './controllers';
import * as services from './services';

import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { EstimateDetail } from './entities/estimate-detail.entity';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([EstimateManagement, EstimateDetail]),
        CommonModule,
        LogModule,
    ],
    controllers: controllerArray,
    providers: serviceArray,
    exports: serviceArray,
})
export class EstimateManagementModule {}