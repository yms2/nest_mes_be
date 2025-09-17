import { Module } from '@nestjs/common';
import { ProductionPlanModule } from './plan/production-plan.module';
import { ProductionInstructionModule } from './instruction/production-instruction.module';
@Module({
    imports: [ProductionPlanModule, ProductionInstructionModule],
    exports: [ProductionPlanModule, ProductionInstructionModule],
})
export class ProductionModule {}