import { Put, Controller, Param, Body, Delete, Post, UseGuards, Req,  } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { BusinessInfoDeleteService } from "../services/business-info-delete.service";
import { logService } from "src/modules/log/Services/log.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessInfoDeleteController{
  constructor(
    private readonly businessInfoDeleteService: BusinessInfoDeleteService, // Replace with actual service type
    private readonly logService: logService, // Replace with actual log service type
  ) {}

    @Delete(':businessNumber/hard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
      summary: '사업장 정보 영구 삭제',
      description: '사업장 정보를 영구적으로 삭제합니다.',
    })
    @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
    async hardDeleteBusinessInfo(
      @Param('businessNumber') businessNumber: string,
    ) {
      try {
        await this.businessInfoDeleteService.hardDeleteBusinessInfo(
          businessNumber, 
        ); // 수정자 정보
  
        // 상세 로그 생성
        await this.logService.createBusinessLog({
          action: 'HARD_DELETE',
          username: 'system',
          businessNumber,
          details: '사업장 정보 영구 삭제',
        });
  
        return ApiResponseBuilder.success(null, '사업장 정보가 영구 삭제되었습니다.');
      } catch (error) {
        // 에러 로그 생성
        await this.logService
          .createBusinessLog({
            action: 'HARD_DELETE_FAIL',
            username: 'system',
            businessNumber,
            details: `영구 삭제 실패: ${(error as Error).message}`,
          })
          .catch(() => {});
  
        throw error;
      }
    }
}