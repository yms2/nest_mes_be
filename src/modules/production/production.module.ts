import { Module } from '@nestjs/common';
import { ProductionPlanModule } from './plan/production-plan.module';
import { ProductionInstructionModule } from './instruction/production-instruction.module';
import { EquipmentProductionModule } from './equipment-production/equipment-production.module';
@Module({
    imports: [ProductionPlanModule, ProductionInstructionModule, EquipmentProductionModule],
    exports: [ProductionPlanModule, ProductionInstructionModule, EquipmentProductionModule],
})
export class ProductionModule {}