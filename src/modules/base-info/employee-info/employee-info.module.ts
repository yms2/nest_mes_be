import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from 'src/common/common.module';
import { LogModule } from '../../log/log.module';
import { EmployeeInfoHandler } from './handlers/employee-info.handler';
import { EmployeeUploadService } from './services/employee-upload/employee-upload.service';
import { EmployeeBankModule } from './employee-bank/employee-bank.module';
const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
    imports: [
        EmployeeBankModule,
        CommonModule,
        LogModule,
        TypeOrmModule.forFeature([Employee]),
    ],
    controllers: controllerArray,
    providers: [...serviceArray, EmployeeInfoHandler, EmployeeUploadService],
    exports: serviceArray,
})
export class EmployeeInfoModule {}