import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { SettingCreateService } from '../services/setting-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { UpdateSubCodeDto } from '../dto/setting-update.entity';
import { SubCode } from '../entities/setting.entity';

@ApiTags('설정관리')
@Controller('setting')
export class SettingCreateController {
    constructor(
        private readonly settingCreateService: SettingCreateService,
        private readonly logService: logService,
    ) {}

    @Post()
    @Auth()
    @ApiOperation({ summary: '서브 코드 생성', description: '신규 서브 코드를 생성합니다.' })
    async createSubCode(
        @Body() createSubCodeDto: UpdateSubCodeDto,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {; 
            const result = await this.settingCreateService.createSubCode(createSubCodeDto, req.user.username);
            await this.writeCreateLog(result, req.user.username);
            return ApiResponseBuilder.success(result, '서브 코드가 생성되었습니다.');
        } catch (error) {
           
            await this.writeCreateFailLog(createSubCodeDto, req.user.username, error);
            throw error;
        }
    }

    private async writeCreateLog(result: SubCode, username: string) {
        await this.logService.createDetailedLog({
            moduleName: '설정관리',
            action: 'CREATE',
            username,
            targetId: result.id.toString(),
            targetName: result.subCode,
            details: '서브 코드 생성',
        });
    }

    private async writeCreateFailLog(dto: UpdateSubCodeDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
            moduleName: '설정관리',
            action: 'CREATE_FAIL',
            username,
            targetId: '',
            targetName: dto.subCodeName || 'N/A',
            details: `서브 코드 생성 실패: ${error.message}`,
        });
    }
}