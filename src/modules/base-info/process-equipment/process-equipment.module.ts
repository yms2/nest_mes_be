import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessEquipment } from './entities/process-equipment.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from '@/common/common.module';
import { LogModule } from '@/modules/log/log.module';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProcessEquipment]),   
  ],
  controllers: controllerArray,
  providers: [...serviceArray],
  exports: serviceArray,
})
export class ProcessEquipmentModule {}
