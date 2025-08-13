import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeBank } from './entities/employee-bank.entity';
import {
  EmployeeBankReadService,
  EmployeeBankCreateService,
  EmployeeBankUpdateService,
  EmployeeBankDeleteService
} from './services';
import {
  EmployeeBankReadController,
  EmployeeBankCreateController,
  EmployeeBankUpdateController,
  EmployeeBankDeleteController  
} from './controllers';
import { CommonModule } from '../../../../common/common.module';
import { LogModule } from '../../../log/log.module';
import { EmployeeBankHandler } from './handlers/employee-bank.handler';
import { EmployeeBankCreateHandler } from './handlers/employee-bank-create.handler';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([EmployeeBank]),
  ],
  controllers: [
    EmployeeBankReadController,
    EmployeeBankCreateController,
    EmployeeBankUpdateController,
    EmployeeBankDeleteController,
  ],
  providers: [
    EmployeeBankReadService,
    EmployeeBankCreateService,
    EmployeeBankUpdateService,
    EmployeeBankDeleteService,
    // ✅ 핸들러 추가
    EmployeeBankHandler,
    // ✅ DTO 추가
    EmployeeBankCreateHandler,
  ],
  exports: [
    EmployeeBankReadService,
    EmployeeBankCreateService,
    EmployeeBankUpdateService,
    EmployeeBankDeleteService,
  ],
})
export class EmployeeBankModule {}