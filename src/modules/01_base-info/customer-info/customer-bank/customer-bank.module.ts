import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerBank } from './entities/customer-bank.entity';
import {
  CustomerBankReadService,
  CustomerBankCreateService,
  CustomerBankUpdateService,
  CustomerBankDeleteService
} from './services';
import {
  CustomerBankReadController,
  CustomerBankCreateController,
  CustomerBankUpdateController,
  CustomerBankDeleteController
} from './controllers';
import { CommonModule } from '../../../../common/common.module';
import { LogModule } from '../../../log/log.module';
import { CustomerBankHandler } from './handlers/customer-bank.handler';
import { CustomerBankCreateHandler } from './handlers/customer-bank-create.handler';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([CustomerBank]),
  ],
  controllers: [
    CustomerBankReadController,
    CustomerBankCreateController,
    CustomerBankUpdateController,
    CustomerBankDeleteController,
  ],
  providers: [
    CustomerBankReadService,
    CustomerBankCreateService,
    CustomerBankUpdateService,
    CustomerBankDeleteService,
    // ✅ 핸들러 추가
    CustomerBankHandler,
    // ✅ DTO 추가
    CustomerBankCreateHandler,
  ],
  exports: [
    CustomerBankReadService,
    CustomerBankCreateService,
    CustomerBankUpdateService,
    CustomerBankDeleteService,
  ],
})
export class CustomerBankModule {}