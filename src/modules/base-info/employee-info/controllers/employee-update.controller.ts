import { Controller, Put, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CreateEmployeeDto } from '../dto/employee-create.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { EmployeeUpdateService } from '../services/employee-update.service';
import { logService } from 'src/modules/log/Services/log.service';
import { DevUserInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { Employee } from '../entities/employee.entity';

@ApiTags('EmployeeInfo')
@Controller('employee-info')
export class EmployeeUpdateController {
    constructor(
        private readonly employeeUpdateService: EmployeeUpdateService,
        private readonly logService: logService,
    ) {}

    @Put(':id')
    @DevUserInfoAuth.update()
    @ApiOperation({ summary: 'id 정보 수정', description: '기존 직원 정보를 수정합니다.' })
    async updateEmployeeInfo(
        @Param('id') id: number,
        @Body() createEmployeeDto: CreateEmployeeDto,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            const result = await this.employeeUpdateService.updateEmployee(
                id,
                createEmployeeDto,
                req.user.username,
            );
            await this.writeUpdateLog(result, req.user.username);
            return ApiResponseBuilder.success(result, '직원 정보가 수정되었습니다.');
        } catch (error) {
            await this.writeUpdateFailLog(createEmployeeDto, req.user.username, error);
            throw error;
        }
    }

    private async writeUpdateLog(result: Employee, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '직원관리',
            action: 'UPDATE',
            username,
            targetId: result.employeeCode,
            targetName: result.employeeName,
            details: '직원 정보 수정',
        });
    }

    private async writeUpdateFailLog(dto: CreateEmployeeDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '직원관리',
            action: 'UPDATE_FAIL',
            username,
            targetId: dto.employeeName,
            targetName: dto.employeeName,
            details: '직원 정보 수정 실패',
        });
    }
    
}