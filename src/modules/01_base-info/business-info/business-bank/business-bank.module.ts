import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessBank } from './entities/business-bank.entity';
import {
  BusinessBankCreateService,
  BusinessBankReadService,
  BusinessBankUpdateService,
  BusinessBankDeleteService,
} from './services';
import {
  BusinessBankCreateController,
  BusinessBankReadController,
  BusinessBankUpdateController,
  BusinessBankDeleteController,
} from './controllers';
import { CommonModule } from '../../../../common/common.module'; 
import { LogModule } from '../../../log/log.module';
import { BusinessBankHandler } from './handlers/business-bank.handler';
import { UpdateBusinessBankHandler } from './handlers/update-business-bank.handler';

@Module({
  imports: [
    CommonModule,
    LogModule, 
    TypeOrmModule.forFeature([BusinessBank]), 
  ],
  controllers: [
    BusinessBankCreateController,
    BusinessBankReadController,
    BusinessBankUpdateController, 
    BusinessBankDeleteController, 
  ],
  providers: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankUpdateService, 
    BusinessBankDeleteService,
    // ✅ 핸들러 추가
    BusinessBankHandler,
    UpdateBusinessBankHandler, 
  ],
  exports: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankUpdateService,
    BusinessBankDeleteService, 
  ], 
})
export class BusinessBankModule {}