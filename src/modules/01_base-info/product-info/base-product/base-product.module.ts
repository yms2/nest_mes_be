import { LogModule } from '@/modules/log/log.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseProduct } from './entities/base-product.entity';
import { CustomerInfo } from '../../customer-info/entities/customer-info.entity';
import {
  BaseProductCreateController,
  BaseProductReadController,
  BaseProductUpdateController,
  BaseProductDeleteController,
} from './controllers';

import {
  BaseProductReadService,
  BaseProductCreateService,
  BaseProductUpdateService,
  BaseProductDeleteService,
} from './services';
import { BaseProductHandler } from './handlers/base-product.handler';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, LogModule, TypeOrmModule.forFeature([BaseProduct, CustomerInfo])],
  controllers: [
    BaseProductCreateController,
    BaseProductReadController,
    BaseProductUpdateController,
    BaseProductDeleteController,
  ],
  providers: [
    BaseProductCreateService,
    BaseProductReadService,
    BaseProductUpdateService,
    BaseProductDeleteService,
    BaseProductHandler,
  ],
  exports: [
    BaseProductCreateService,
    BaseProductReadService,
    BaseProductDeleteService,
    BaseProductUpdateService,
  ],
})
export class BaseProductModule {}