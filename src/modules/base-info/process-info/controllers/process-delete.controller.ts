import { Controller, Delete, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { logService } from 'src/modules/log/Services/log.service';
import { ProcessDeleteService } from '../services/process-delete.service';

@ApiTags('ProcessInfo')
@Controller('process-info')
export class ProcessDeleteController {
    constructor(
        private readonly processDeleteService: ProcessDeleteService,
        private readonly logService: logService,
    ) {}

    @Delete(':id')
    @Auth()
    @ApiOperation({ summary: '공정 정보 영구 삭제', description: '공정 정보를 영구적으로 삭제합니다.' })
    @ApiParam({ name: 'id', description: 'ID', example: '1' })
    async deleteProcessInfo(
        @Param('id') id: string,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            await this.processDeleteService.hardDeleteProcessInfo(Number(id));

            await this.logService.createDetailedLog({
                moduleName: '공정관리',
                action: 'HARD_DELETE',
                username: req.user.username,
                targetId: id,
                details: '공정 정보 영구 삭제',
            });

            return ApiResponseBuilder.success(null, '공정 정보가 영구 삭제되었습니다.');
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '공정관리',
                action: 'HARD_DELETE_FAIL',
                username: req.user.username,
                targetId: id,
                details: `영구 삭제 실패: ${(error as Error).message}`,
            });

            throw error;
        }
    }
}