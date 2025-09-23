import { Module } from "@nestjs/common";
import { EquipmentManagementModule } from "./equipment_management/equipment-management.module";
import { EquipmentHistoryModule } from "./equipment_history_management/equipment-history.module";

@Module({
    imports: [EquipmentManagementModule, EquipmentHistoryModule],
    exports: [EquipmentManagementModule, EquipmentHistoryModule],
})
export class EquipmentModule {}