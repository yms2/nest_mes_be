import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerBank } from './entities/customer-bank.entity';
import {
  CustomerBankReadService,
  CustomerBankCreateService,
  CustomerBankUpdateService
} from './services';
import {
  CustomerBankReadController,
  CustomerBankCreateController,
  CustomerBankUpdateController
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
  ],
  providers: [
    CustomerBankReadService,
    CustomerBankCreateService,
    CustomerBankUpdateService,
    // ✅ 핸들러 추가
    CustomerBankHandler,
    // ✅ DTO 추가
    CustomerBankCreateHandler,
  ],
  exports: [
    CustomerBankReadService,
    CustomerBankCreateService,
    CustomerBankUpdateService,
  ],
})
export class CustomerBankModule {}