import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoCreateService } from './services/business-info-create.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessInfo])],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoCreateService],
  exports: [BusinessInfoCreateService],
})
export class BusinessInfoModule {}
