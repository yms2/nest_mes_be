import { Module } from "@nestjs/common";
import { EquipmentManagementModule } from "./equipment_management/equipment-management.module";

@Module({
    imports: [EquipmentManagementModule],
    exports: [EquipmentManagementModule],
})
export class EquipmentModule {}