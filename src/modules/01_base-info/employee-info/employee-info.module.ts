import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from 'src/common/common.module';
import { LogModule } from '../../log/log.module';
import { EmployeeInfoHandler } from './handlers/employee-info.handler';
const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
    imports: [
        CommonModule,
        LogModule,
        TypeOrmModule.forFeature([Employee]),
    ],
    controllers: controllerArray,
    providers: [...serviceArray, EmployeeInfoHandler],
    exports: serviceArray,
})
export class EmployeeInfoModule {}