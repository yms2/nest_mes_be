import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { EmployeeCreateService } from '../services/employee-create.service';

import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CreateEmployeeDto } from '../dto/employee-create.dto';
import { Employee } from '../entities/employee.entity';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('EmployeeInfo')
@Controller('employee-info')
export class EmployeeCreateController {
    constructor(
        private readonly employeeCreateService: EmployeeCreateService,
        private readonly logService: logService,
    ) {}

    @Post()
    @Auth()
    @ApiOperation({ summary: '직원 정보 생성', description: '신규 직원 정보를 생성합니다.' })
    async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: Request & { user: { username: string } }) {
        try {
            const result = await this.employeeCreateService.createEmployee(createEmployeeDto, req.user.username);

            await this.writeCreateLog(result, req.user.username);

            return ApiResponseBuilder.success(result, '직원 정보가 생성되었습니다.');
        } catch (error) {
            await this.writeCreateFailLog(createEmployeeDto, req.user.username, error);
            throw error;
        }
    }

    private async writeCreateLog(result: Employee, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '직원관리',
            action: 'CREATE',
            username,
            targetId: result.employeeCode,
            targetName: result.employeeName,
        });
    }

    private async writeCreateFailLog(dto: CreateEmployeeDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '직원관리',
            action: 'CREATE_FAIL',
            username,
            targetId: dto.employeeName,
            targetName: dto.employeeName,
        });
    }
}