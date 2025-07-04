import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoCreateService } from './services/business-info-create.service';
import { BusinessInfoReadService } from './services/business-info-read.service';
import { BusinessInfoSearchService } from './services/business-info-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessInfo])],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoCreateService, BusinessInfoReadService, BusinessInfoSearchService],
  exports: [BusinessInfoCreateService, BusinessInfoReadService, BusinessInfoSearchService],
})
export class BusinessInfoModule {}
