import { Controller, Delete, NotFoundException, Param, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingDeleteService } from '../services/setting-delete.service';
import { SubCode } from '../entities/setting.entity';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { logService } from '@/modules/log/Services/log.service';

@ApiTags('설정관리')
@Controller('setting')
export class SettingDeleteController {
    constructor(
        private readonly settingDeleteService: SettingDeleteService,
        private readonly logService: logService,
    ) {}

    @Delete(':id')
    @Auth()
    @ApiOperation({ summary: '서브 코드 삭제', description: '서브 코드를 삭제합니다.' })
    @ApiResponse({ status: 200, description: '서브 코드 삭제 성공' })
    @ApiParam({ name: 'id', description: '서브 코드 ID', example: 1 })

    async deleteSubCode(
        @Param('id') id: number,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            await this.settingDeleteService.deleteSubCode(id);
            return ApiResponseBuilder.success(null, '서브 코드 삭제 성공');
        } catch (error) {
            return ApiResponseBuilder.error(error.message);
        } finally {
            await this.logService.createDetailedLog({
                moduleName: '설정 관리',
                action: 'DELETE',
                username: req.user.username,
                targetId: id.toString(),
                details: '서브 코드 삭제',
            });
        }
    }

}
