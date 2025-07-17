import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerBank } from './entities/customer-bank.entity';
import {
  CustomerBankReadService,
} from './services';
import {
  CustomerBankReadController
} from './controllers';
import { CommonModule } from '../../../../common/common.module';
import { LogModule } from '../../../log/log.module';
import { CustomerBankHandler } from './handlers/customer-bank-handler';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([CustomerBank]),
  ],
  controllers: [
    CustomerBankReadController,
  ],
  providers: [
    CustomerBankReadService,
    // ✅ 핸들러 추가
    CustomerBankHandler,

  ],
  exports: [
    CustomerBankReadService,
  ],
})
export class CustomerBankModule {}