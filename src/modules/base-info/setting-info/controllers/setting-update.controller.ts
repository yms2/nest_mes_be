import { Controller, Put, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { SettingUpdateService } from '../services/setting-update.service';
import { UpdateSubCodeDto } from '../dto/setting-update.entity';
import { SubCode } from '../entities/setting.entity';

@ApiTags('설정관리')
@Controller('setting')
export class SettingUpdateController {
    constructor(
        private readonly settingUpdateService: SettingUpdateService,
        private readonly logService: logService,
    ) {}

    @Put(':id')
    @Auth()
    @ApiOperation({ summary: '서브 코드 수정', description: '기존 서브 코드를 수정합니다.' })
    @ApiParam({ name: 'id', description: '서브 코드 ID', example: '1' })
    async updateSubCode(
        @Param('id') id: number,
        @Body() updateSubCodeDto: UpdateSubCodeDto,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            const result = await this.settingUpdateService.updateSubCode(id, updateSubCodeDto);
            await this.writeUpdateLog(result, req.user.username);
            return ApiResponseBuilder.success(result, '서브 코드가 수정되었습니다.');
        } catch (error) {
            await this.writeUpdateFailLog(updateSubCodeDto, req.user.username, error);
            throw error;
        }
    }

    private async writeUpdateLog(result: SubCode, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '설정정보',
            action: 'UPDATE',
            username,
            targetId: result.id.toString(),
            targetName: result.subCode,
            details: '서브 코드 수정',
        });
    }

    private async writeUpdateFailLog(dto: UpdateSubCodeDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '설정정보',
            action: 'UPDATE_FAIL',
            username,
            targetId: '',
            targetName: dto.subCodeName || 'N/A',
            details: `서브 코드 수정 실패: ${error.message}`,
        });
    }
}