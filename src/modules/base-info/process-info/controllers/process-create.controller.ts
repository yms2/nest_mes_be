import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { ProcessCreateService } from '../services/process-create.service';

import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CreateProcessInfoDto } from '../dto/process-create.dto';
import { ProcessInfo } from '../entities/process.entity';
import { DevProcessInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';


@ApiTags('ProcessInfo')
@Controller('process-info')
export class ProcessCreateController {
    constructor(
        private readonly processCreateService: ProcessCreateService,
        private readonly logService: logService,
    ) {}

    @Post()
    @DevProcessInfoAuth.create()
    @ApiOperation({ summary: '공정 정보 생성', description: '신규 공정 정보를 생성합니다.' })
    async createProcessInfo(
        @Body() createProcessInfoDto: CreateProcessInfoDto,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            const result = await this.processCreateService.createProcessInfo(
                createProcessInfoDto,
                req.user.username,
            );

            await this.writeCreateLog(result, req.user.username);

            return ApiResponseBuilder.success(result, '공정 정보 등록되었습니다.');
        } catch (error) {
            await this.writeCreateFailLog(createProcessInfoDto, req.user.username, error);
            throw error;
        }
    }
    
    private async writeCreateLog(result: ProcessInfo, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '공정관리',
            action: 'CREATE',
            username,
            targetId: result.processCode,
            targetName: result.processName,
            details: '새로운 공정 정보 생성',
        });
    }

    private async writeCreateFailLog(dto: CreateProcessInfoDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '공정관리',
            action: 'CREATE_FAIL',
            username,
            targetId: dto.processName,
            targetName: dto.processName,
            details: `생성 실패: ${error.message}`,
        });
    }
}