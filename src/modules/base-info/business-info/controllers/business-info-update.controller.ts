import { Put, Controller, Param, Body,  } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { NotEmptyStringPipe } from "src/common/pipes/not-empty-string.pipe";
import { UpdateBusinessInfoDto } from "../dto/update-business-info.dto";
import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { BusinessInfoUpdateService } from "../services/business-info-update.service";
import { logService } from "src/modules/log/Services/log.service";
@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessInfoUpdateController {

  constructor(
    private readonly businessInfoUpdateService: BusinessInfoUpdateService, // Replace with actual service type
    private readonly logService: logService, // Replace with actual log service type
  ) {}

    @Put(':businessNumber')
    @ApiOperation({ summary: '사업장 정보 수정', description: '기존 사업장 정보를 수정합니다.' })
    @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
    async updateBusinessInfo(
      @Param('businessNumber') businessNumber: string,
      @Body('businessNumber', NotEmptyStringPipe) bodyBusinessNumber: string,
      @Body('businessName', NotEmptyStringPipe) bodyBusinessName: string,
      @Body('businessCeo', NotEmptyStringPipe) bodyBusinessCeo: string,
      @Body() updateBusinessInfoDto: UpdateBusinessInfoDto,
    ) {
      try {
        const result = await this.businessInfoUpdateService.updateBusinessInfo(
          businessNumber,
          updateBusinessInfoDto,
        );
  
        // 상세 로그 생성
        await this.logService.createBusinessLog({
          action: 'UPDATE',
          username: 'system',
          businessNumber: result.businessNumber,
          businessName: result.businessName,
          details: '사업장 정보 수정',
        });
  
        return ApiResponseBuilder.success(result, '사업장 정보가 수정되었습니다.');
      } catch (error) {
        // 에러 로그 생성
        await this.logService
          .createBusinessLog({
            action: 'UPDATE_FAIL',
            username: 'system',
            businessNumber,
            details: `수정 실패: ${(error as Error).message}`,
          })
          .catch(() => {});
  
        throw error;
      }
    }
} 