import { Body, Controller, Put, Param, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from "@nestjs/swagger";
import { ClaimUpdateService } from "../services/claim-update.service";
import { UpdateClaimDto } from "../dto/update-claim.dto";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Request } from "express";

@DevAuth()
@ApiTags('AS 클레임 관리')
@Controller('claim')
export class ClaimUpdateController {
    constructor(
        private readonly claimUpdateService: ClaimUpdateService,
    ) {}

    @Put('update/:id')
    @ApiOperation({ 
        summary: '클레임 수정',
        description: '기존 클레임의 정보를 수정합니다.'
    })
    @ApiParam({ name: 'id', description: '클레임 ID', example: 1 })
    @ApiBody({ 
        type: UpdateClaimDto,
        description: '클레임 수정 정보',
        examples: {
            example1: {
                summary: '기본 정보 수정',
                description: '클레임의 기본 정보를 수정하는 예시',
                value: {
                    customerName: '수정된 고객명',
                    claimQuantity: 15,
                    claimPrice: 150000,
                    claimReason: '수정된 클레임 사유',
                    remark: '수정된 비고'
                }
            },
            example2: {
                summary: '상태 및 우선순위 변경',
                description: '클레임 상태와 우선순위를 변경하는 예시',
                value: {
                    claimStatus: 'PROCESSING',
                    employeeCode: 'EMP002',
                    employeeName: '김철수'
                }
            },
            example3: {
                summary: '처리 완료',
                description: '클레임을 완료 상태로 변경하는 예시',
                value: {
                    claimStatus: '완료',
                    completionDate: '2025-01-20',
                    resolution: '교체 완료 - 새 제품으로 교체하여 고객에게 전달'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '클레임 수정 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                data: { $ref: '#/components/schemas/Claim' }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: '클레임을 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', description: '오류 메시지' }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: '클레임 수정 실패 - 유효성 검사 오류',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', description: '오류 메시지' }
            }
        }
    })
    async updateClaim(
        @Param('id') id: string,
        @Body() updateClaimDto: UpdateClaimDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.claimUpdateService.updateClaim(parseInt(id), updateClaimDto, username);
    }
}
