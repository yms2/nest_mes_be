import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { EstimateManagement } from '../../business-info/estimatemanagement-info/entities/estimatemanagement.entity';
import { CustomerInfo } from '../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../base-info/product-info/product_sample/entities/product-info.entity';
import { Employee } from '../../base-info/employee-info/entities/employee.entity';
import { ClaimCreateService } from './services/claim-create.service';
import { ClaimCreateController } from './controllers/claim-create.controller';
import { ClaimReadService } from './services/claim-read.service';
import { ClaimReadController } from './controllers/claim-read.controller';
import { ClaimUpdateService } from './services/claim-update.service';
import { ClaimUpdateController } from './controllers/claim-update.controller';
import { ClaimDeleteService } from './services/claim-delete.service';
import { ClaimDeleteController } from './controllers/claim-delete.controller';
import { ClaimDownloadService } from './services/claim-download.service';
import { ClaimUploadService } from './services/claim-upload.service';
import { ClaimExcelController } from './controllers/claim-excel.controller';
import { LogModule } from '@/modules/log/log.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Claim, EstimateManagement, CustomerInfo, ProductInfo, Employee]),
        LogModule,
    ],
    controllers: [
        ClaimCreateController,
        ClaimReadController,
        ClaimUpdateController,
        ClaimDeleteController,
        ClaimExcelController,
    ],
    providers: [
        ClaimCreateService,
        ClaimReadService,
        ClaimUpdateService,
        ClaimDeleteService,
        ClaimDownloadService,
        ClaimUploadService,
    ],
    exports: [
        ClaimCreateService,
        ClaimReadService,
        ClaimUpdateService,
        ClaimDeleteService,
        ClaimDownloadService,
        ClaimUploadService,
    ],
})
export class ClaimModule {}
