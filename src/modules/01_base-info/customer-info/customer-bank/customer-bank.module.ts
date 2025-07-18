import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerBank } from './entities/customer-bank.entity';
import {
  CustomerBankReadService,
  CustomerBankCreateService
} from './services';
import {
  CustomerBankReadController,
  CustomerBankCreateController 
} from './controllers';
import { CommonModule } from '../../../../common/common.module';
import { LogModule } from '../../../log/log.module';
import { CustomerBankHandler } from './handlers/customer-bank.handler';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([CustomerBank]),
  ],
  controllers: [
    CustomerBankReadController,
    CustomerBankCreateController
  ],
  providers: [
    CustomerBankReadService,
    CustomerBankCreateService,
    // ✅ 핸들러 추가
    CustomerBankHandler,

  ],
  exports: [
    CustomerBankReadService,
    CustomerBankCreateService,
  ],
})
export class CustomerBankModule {}