import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerInfo } from './entities/customer-info.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { CustomerInfoHandler } from './handlers/customer-info.handler';
import { CustomerBankModule } from './customer-bank/customer-bank.module';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
  imports: [
    CustomerBankModule,
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([CustomerInfo]),
  ],
  controllers: controllerArray,
  providers: [...serviceArray, CustomerInfoHandler],
  exports: serviceArray,
})
export class CustomerInfoModule {}
