import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import * as services from './services';
import * as controllers from './controllers';
import { LogModule } from '@/modules/log/log.module';
import { CommonModule } from '@/common/common.module';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
  imports: [TypeOrmModule.forFeature([Equipment]), CommonModule, LogModule],
  controllers: controllerArray,
  providers: [...serviceArray],
  exports: serviceArray,
})
export class EquipmentManagementModule {}
