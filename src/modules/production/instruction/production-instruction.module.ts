import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionInstruction } from './entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { ProductionInstructionService } from './services/production-instruction-create.service';
import { ProductionInstructionReadService } from './services/production-instruction-read.service';
import { ProductionInstructionUpdateService } from './services/production-instruction-update.service';
import { ProductionInstructionDeleteService } from './services/production-instruction-delete.service';
import { ProductionInstructionDownloadService } from './services/production-instruction-download.service';
import { ProductionInstructionController } from './controllers/production-instruction-create.controller';
import { ProductionInstructionReadController } from './controllers/production-instruction-read.controller';
import { ProductionInstructionUpdateController } from './controllers/production-instruction-update.controller';
import { ProductionInstructionDeleteController } from './controllers/production-instruction-delete.controller';
import { ProductionInstructionDownloadController } from './controllers/production-instruction-download.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionInstruction,
      ProductionPlan,
    ]),
    CommonModule,
  ],    
  controllers: [
    ProductionInstructionController,
    ProductionInstructionReadController,
    ProductionInstructionUpdateController,
    ProductionInstructionDeleteController,
    ProductionInstructionDownloadController,
  ],
  providers: [
    ProductionInstructionService,
    ProductionInstructionReadService,
    ProductionInstructionUpdateService,
    ProductionInstructionDeleteService,
    ProductionInstructionDownloadService,
  ],
  exports: [
    ProductionInstructionService,
    ProductionInstructionReadService,
    ProductionInstructionUpdateService,
    ProductionInstructionDeleteService,
    ProductionInstructionDownloadService,
  ],
})
export class ProductionInstructionModule {}
