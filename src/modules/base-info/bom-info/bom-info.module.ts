import { LogModule } from 'src/modules/log/log.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as controllers from './controllers';
import * as services from './services';
import { Module } from '@nestjs/common';
import { ProductInfo } from '../product-info/product_sample/entities/product-info.entity';
import { BomInfo } from './entities/bom-info.entity';
import { BomProcess } from './entities/bom-process.entity';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProductInfo, BomInfo, BomProcess]), // BomInfo 추가!
  ],
  controllers: controllerArray,
  providers: [...serviceArray],
  exports: serviceArray,
})
export class BomInfoModule {}
