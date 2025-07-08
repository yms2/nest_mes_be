import { Put, Controller, Param, Body, Delete, Post,  } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { BusinessInfoDeleteService } from "../services/business-info-delete.service";
import { logService } from "src/modules/log/Services/log.service";

@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessInfoDeleteController{
  constructor(
    private readonly businessInfoDeleteService: BusinessInfoDeleteService, // Replace with actual service type
    private readonly logService: logService, // Replace with actual log service type
  ) {}

  
    @Delete(':businessNumber')
    @ApiOperation({
      summary: '사업장 정보 삭제',
      description: '사업장 정보를 삭제합니다. (소프트 삭제)',
    })
    @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
    async deleteBusinessInfo(@Param('businessNumber') businessNumber: string) {
      try {
        await this.businessInfoDeleteService.deleteBusinessInfo(businessNumber);
  
        // 상세 로그 생성
        await this.logService.createBusinessLog({
          action: 'DELETE',
          username: 'system',
          businessNumber,
          details: '사업장 정보 소프트 삭제',
        });
  
        return ApiResponseBuilder.success(null, '사업장 정보가 삭제되었습니다.');
      } catch (error) {
        // 에러 로그 생성
        await this.logService
          .createBusinessLog({
            action: 'DELETE_FAIL',
            username: 'system',
            businessNumber,
            details: `삭제 실패: ${(error as Error).message}`,
          })
          .catch(() => {});
  
        throw error;
      }
    }
  
    @Delete(':businessNumber/hard')
    @ApiOperation({
      summary: '사업장 정보 영구 삭제',
      description: '사업장 정보를 영구적으로 삭제합니다.',
    })
    @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
    async hardDeleteBusinessInfo(@Param('businessNumber') businessNumber: string) {
      try {
        await this.businessInfoDeleteService.hardDeleteBusinessInfo(businessNumber);
  
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
  
      @Post(':businessNumber/restore')
      @ApiOperation({ summary: '사업장 정보 복원', description: '삭제된 사업장 정보를 복원합니다.' })
      @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
      async restoreBusinessInfo(@Param('businessNumber') businessNumber: string) {
        try {
          const result = await this.businessInfoDeleteService.restoreBusinessInfo(businessNumber);
    
          // 상세 로그 생성
          await this.logService.createBusinessLog({
            action: 'RESTORE',
            username: 'system',
            businessNumber: result.businessNumber,
            businessName: result.businessName,
            details: '삭제된 사업장 정보 복원',
          });
    
          return ApiResponseBuilder.success(result, '사업장 정보가 복원되었습니다.');
        } catch (error) {
          // 에러 로그 생성
          await this.logService
            .createBusinessLog({
              action: 'RESTORE_FAIL',
              username: 'system',
              businessNumber,
              details: `복원 실패: ${(error as Error).message}`,
            })
            .catch(() => {});
    
          throw error;
        }
      }
    
}