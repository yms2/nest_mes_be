import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentHistory } from './entities/equipment-history.entity';
import { EquipmentHistoryCreateService } from './services/equipment-history-create.service';
import { EquipmentHistoryReadService } from './services/equipment-history-read.service';
import { EquipmentHistoryUpdateService } from './services/equipment-history-update.service';
import { EquipmentHistoryDeleteService } from './services/equipment-history-delete.service';
import { EquipmentHistoryCreateController } from './controllers/equipment-history-create.controller';
import { EquipmentHistoryReadController } from './controllers/equipment-history-read.controller';
import { EquipmentHistoryUpdateController } from './controllers/equipment-history-update.controller';
import { EquipmentHistoryDeleteController } from './controllers/equipment-history-delete.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentHistory])],
  controllers: [
    EquipmentHistoryCreateController,
    EquipmentHistoryReadController,
    EquipmentHistoryUpdateController,
    EquipmentHistoryDeleteController,
  ],
  providers: [
    EquipmentHistoryCreateService,
    EquipmentHistoryReadService,
    EquipmentHistoryUpdateService,
    EquipmentHistoryDeleteService,
  ],
  exports: [
    EquipmentHistoryCreateService,
    EquipmentHistoryReadService,
    EquipmentHistoryUpdateService,
    EquipmentHistoryDeleteService,
  ],
})
export class EquipmentHistoryModule {}
