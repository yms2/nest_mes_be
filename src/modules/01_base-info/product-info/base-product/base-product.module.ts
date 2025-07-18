import { LogModule } from "@/modules/log/log.module";
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseProduct } from './entities/base-product.entity';
import {
  BaseProductReadController,
} from './controllers';

import {
  BaseProductReadService,
} from './services';
import { BaseProductHandler } from './handlers/base-product.handler';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, LogModule, TypeOrmModule.forFeature([BaseProduct])],
  controllers: [
    BaseProductReadController,
  ],
  providers: [
    BaseProductReadService,
    BaseProductHandler,
  ],
  exports: [
    BaseProductReadService,
  ],
})
export class BaseProductModule {}