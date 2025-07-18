import { LogModule } from '@/modules/log/log.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseProduct } from './entities/base-product.entity';
import { CustomerInfo } from '../../customer-info/entities/customer-info.entity';
import {
  BaseProductCreateController,
  BaseProductReadController,
} from './controllers';

import {
  BaseProductReadService,
  BaseProductCreateService,
} from './services';
import { BaseProductHandler } from './handlers/base-product.handler';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, LogModule, TypeOrmModule.forFeature([BaseProduct, CustomerInfo])],
  controllers: [
    BaseProductCreateController,
    BaseProductReadController,
  ],
  providers: [
    BaseProductCreateService,
    BaseProductReadService,
    BaseProductHandler,
  ],
  exports: [
    BaseProductCreateService,
    BaseProductReadService,
  ],
})
export class BaseProductModule {}