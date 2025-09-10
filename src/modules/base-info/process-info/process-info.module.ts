import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessInfo } from './entities/process.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { ProcessHandler } from './handlers/process-handler';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([ProcessInfo]),
  ],
  controllers: controllerArray,
  providers: [...serviceArray, ProcessHandler],
  exports: serviceArray,
})

export class ProcessInfoModule {}