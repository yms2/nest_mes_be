import { Controller, Delete, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { EmployeeDeleteService } from '../services/employee-delete.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('EmployeeInfo')
@Controller('employee-info')
export class EmployeeDeleteController {
    constructor(
        private readonly employeeDeleteService: EmployeeDeleteService,
        private readonly logService: logService,
    ) {}

    @Delete(':id')
    @Auth()
    @ApiOperation({
        summary: '직원 정보 영구 삭제',
        description: '직원 정보를 영구적으로 삭제합니다.',
    })
    @ApiParam({ name: 'id', description: 'ID', example: '1' })
    async deleteEmployeeInfo(
        @Param('id') id: string,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            await this.employeeDeleteService.hardDeleteEmployee(Number(id));
            await this.writeDeleteLog(id, req.user.username);
            return ApiResponseBuilder.success(null, '직원 정보가 삭제되었습니다.');
        } catch (error) {
            await this.writeDeleteFailLog(id, req.user.username, error);
            throw error;
        }
    }

    private async writeDeleteLog(id: string, username: string) {
            await this.logService.createDetailedLog({
                moduleName: '직원관리',
                action: 'HARD_DELETE',
                username,
                targetId: id,
                targetName: id,
                details: '직원 정보 영구 삭제',
            });
        }

        private async writeDeleteFailLog(id: string, username: string, error: Error) {
            await this.logService.createDetailedLog({
                moduleName: '직원관리',
                action: 'HARD_DELETE_FAIL',
                username,
                targetId: id,
                targetName: id,
                details: `직원 정보 영구 삭제 실패: ${error.message}`,
            });
        }
    
}