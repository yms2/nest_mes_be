import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { ClaimCreateService } from "../services/claim-create.service";
import { CreateClaimDto } from "../dto/create-claim.dto";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Request } from "express";

@DevAuth()
@ApiTags('AS 클레임 관리')
@Controller('claim')
export class ClaimCreateController {
    constructor(
        private readonly claimCreateService: ClaimCreateService,
    ) {}

    @Post('create')
    @ApiOperation({ 
        summary: '클레임 생성',
        description: '새로운 AS 클레임을 생성합니다. 클레임 코드는 자동 생성되며, 중복 확인 후 저장됩니다.'
    })
    @ApiBody({ 
        type: CreateClaimDto,
        description: '클레임 생성 정보',
        examples: {
            example1: {
                summary: '기본 클레임 생성',
                description: '필수 정보만으로 클레임을 생성하는 예시',
                value: {
                    claimDate: '2025-01-19',
                    customerCode: 'CUS001',
                    customerName: 'ABC 회사',
                    projectCode: 'PRJ001',
                    projectName: '프로젝트 A',
                    productCode: 'PRD001',
                    productName: '제품 A',
                    claimQuantity: 10,
                    claimPrice: 100000,
                    claimReason: '불량품 교체 요청',
                    employeeCode: 'EMP001',
                    employeeName: '홍길동',
                    expectedCompletionDate: '2025-01-25',
                    remark: '긴급 처리 필요'
                }
            },
            example2: {
                summary: '자동 코드 생성',
                description: '클레임 코드를 자동 생성하는 예시',
                value: {
                    claimDate: '2025-01-19',
                    customerCode: 'CUS002',
                    customerName: 'XYZ 회사',
                    projectCode: 'PRJ002',
                    projectName: '프로젝트 B',
                    productCode: 'PRD002',
                    productName: '제품 B',
                    claimQuantity: 5,
                    claimPrice: 50000,
                    claimReason: '품질 불만',
                    employeeCode: 'EMP002',
                    employeeName: '김철수'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: '클레임 생성 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                data: {
                    type: 'object',
                    description: '생성된 클레임 정보',
                    properties: {
                        id: { type: 'number', description: '클레임 ID' },
                        claimCode: { type: 'string', description: '클레임 코드' },
                        claimDate: { type: 'string', description: '클레임 접수일' },
                        customerCode: { type: 'string', description: '고객 코드' },
                        customerName: { type: 'string', description: '고객명' },
                        projectCode: { type: 'string', description: '프로젝트 코드' },
                        projectName: { type: 'string', description: '프로젝트명' },
                        productCode: { type: 'string', description: '품목 코드' },
                        productName: { type: 'string', description: '품목명' },
                        claimQuantity: { type: 'number', description: '클레임 수량' },
                        claimPrice: { type: 'number', description: '클레임 금액' },
                        claimReason: { type: 'string', description: '클레임 사유' },
                        claimStatus: { type: 'string', description: '클레임 상태' },
                        employeeCode: { type: 'string', description: '담당자 코드' },
                        employeeName: { type: 'string', description: '담당자명' },
                        expectedCompletionDate: { type: 'string', description: '예상 완료일' },
                        remark: { type: 'string', description: '비고' },
                        createdAt: { type: 'string', description: '생성일시' },
                        updatedAt: { type: 'string', description: '수정일시' }
                    }
                }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: '클레임 생성 실패 - 유효성 검사 오류',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', description: '오류 메시지' },
                errors: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: '유효성 검사 오류 목록'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 409, 
        description: '클레임 생성 실패 - 중복 코드',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', description: '오류 메시지' }
            }
        }
    })
    async createClaim(
        @Body() createClaimDto: CreateClaimDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.claimCreateService.createClaim(createClaimDto, username);
    }
}
