import { Controller, DefaultValuePipe, Get, ParseBoolPipe, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SettingReadService } from '../services/setting-read.service';
import { DevSettingInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { BaseCode, SubCode } from '../entities/setting.entity';

@ApiTags('설정관리')
@Controller('setting-info')
@UseInterceptors(ClassSerializerInterceptor)
export class SettingReadController {
    constructor(private readonly settingReadService: SettingReadService) {}

    @Get()
    @DevSettingInfoAuth.read()
    @ApiOperation({ 
        summary: '모든 설정 정보 조회', 
        description: '모든 설정 정보를 조회합니다. withSubs 파라미터로 서브 데이터 포함 여부를 선택할 수 있습니다.' 
    })
    @ApiQuery({ 
        name: 'withSubs', 
        description: '서브 데이터 포함 여부', 
        required: false, 
        type: Boolean,
        example: false
    })
    @ApiResponse({ 
        status: 200, 
        description: '설정 정보 조회 성공',
        schema: { 
            type: 'array', 
            items: { $ref: '#/components/schemas/BaseCode' } 
        }
    })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 내부 오류' })
    async getBaseCodes(
        @Query('withSubs', new DefaultValuePipe(false), ParseBoolPipe) withSubs: boolean,
    ): Promise<BaseCode[]> {
        if (withSubs) {
            return this.settingReadService.getBaseCodeWithSubs();
        }
        return this.settingReadService.getBaseCode();
    }

    @Get('sub-codes')
    @DevSettingInfoAuth.read()
    @ApiOperation({ summary: '서브 코드 조회' })
    @ApiQuery({ name: 'baseCodeId', description: '기본 코드 ID', required: true, type: Number })
    async getSubCodes(@Query('baseCodeId') baseCodeId: number): Promise<SubCode[]> {
        return this.settingReadService.getSubCodesByBase(baseCodeId);
    }
}