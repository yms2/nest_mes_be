import { Controller, Put, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CreateProcessInfoDto } from '../dto/process-create.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { ProcessUpdateService } from '../services/process-update.service';
import { logService } from 'src/modules/log/Services/log.service';
import { DevProcessInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ProcessInfo } from '../entities/process.entity';


@ApiTags('ProcessInfo')
@Controller('process-info')
export class ProcessUpdateController {
    constructor(
        private readonly processUpdateService: ProcessUpdateService,
        private readonly logService: logService,
    ) {}

    @Put(':id')
    @DevProcessInfoAuth.update()
    @ApiOperation({ summary: '공정 정보 수정', description: '기존 공정 정보를 수정합니다.' })
    async updateProcessInfo(
        @Param('id') id: number,
        @Body() createProcessInfoDto: CreateProcessInfoDto,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            const result = await this.processUpdateService.updateProcessInfo(
                id,
                createProcessInfoDto,
                req.user.username,
            );
            await this.writeCreateLog(result, req.user.username);

            return ApiResponseBuilder.success(result, '공정 정보가 수정되었습니다.');
        } catch (error) {
            await this.writeCreateFailLog(createProcessInfoDto, req.user.username, error);
            throw error;
        }
    }

    private async writeCreateLog(result: ProcessInfo, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '공정관리',
            action: 'UPDATE',
            username,
            targetId: result.processCode,
            targetName: result.processName,
            details: '새로운 공정 정보 수정',
        });
    }

    private async writeCreateFailLog(dto: CreateProcessInfoDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '공정관리',
            action: 'UPDATE_FAIL',
            username,
            targetId: dto.processName,
            targetName: dto.processName,
            details: `수정 실패: ${error.message}`,
        });
    }
}