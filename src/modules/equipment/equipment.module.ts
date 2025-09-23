import { Module } from "@nestjs/common";
import { EquipmentManagementModule } from "./equipment_management/equipment-management.module";
<<<<<<< HEAD

@Module({
    imports: [EquipmentManagementModule],
    exports: [EquipmentManagementModule],
=======
import { EquipmentHistoryModule } from "./equipment_history_management/equipment-history.module";

@Module({
    imports: [EquipmentManagementModule, EquipmentHistoryModule],
    exports: [EquipmentManagementModule, EquipmentHistoryModule],
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
})
export class EquipmentModule {}