import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentHistory } from './entities/equipment-history.entity';
import { EquipmentHistoryCreateService } from './services/equipment-history-create.service';
import { EquipmentHistoryReadService } from './services/equipment-history-read.service';
import { EquipmentHistoryUpdateService } from './services/equipment-history-update.service';
import { EquipmentHistoryDeleteService } from './services/equipment-history-delete.service';
import { EquipmentHistoryDownloadService } from './services/equipment-history-download.service';
import { EquipmentHistoryCreateController } from './controllers/equipment-history-create.controller';
import { EquipmentHistoryReadController } from './controllers/equipment-history-read.controller';
import { EquipmentHistoryUpdateController } from './controllers/equipment-history-update.controller';
import { EquipmentHistoryDeleteController } from './controllers/equipment-history-delete.controller';
import { EquipmentHistoryDownloadController } from './controllers/equipment-history-download.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentHistory])],
  controllers: [
    EquipmentHistoryCreateController,
    EquipmentHistoryReadController,
    EquipmentHistoryUpdateController,
    EquipmentHistoryDeleteController,
    EquipmentHistoryDownloadController,
  ],
  providers: [
    EquipmentHistoryCreateService,
    EquipmentHistoryReadService,
    EquipmentHistoryUpdateService,
    EquipmentHistoryDeleteService,
    EquipmentHistoryDownloadService,
  ],
  exports: [
    EquipmentHistoryCreateService,
    EquipmentHistoryReadService,
    EquipmentHistoryUpdateService,
    EquipmentHistoryDeleteService,
    EquipmentHistoryDownloadService,
  ],
})
export class EquipmentHistoryModule {}
