import { Body, Controller, Delete, Param, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from "@nestjs/swagger";
import { ClaimDeleteService } from "../services/claim-delete.service";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Request } from "express";

@DevAuth()
@ApiTags('AS 클레임 관리')
@Controller('claim')
export class ClaimDeleteController {
    constructor(
        private readonly claimDeleteService: ClaimDeleteService,
    ) {}

    @Delete('delete/:id')
    @ApiOperation({ 
        summary: '클레임 삭제',
        description: 'ID로 클레임을 삭제합니다. 완료된 클레임은 삭제할 수 없습니다.'
    })
    @ApiParam({ name: 'id', description: '클레임 ID', example: 1 })
    @ApiResponse({ 
        status: 200, 
        description: '클레임 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                deletedClaim: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', description: '클레임 ID' },
                        claimCode: { type: 'string', description: '클레임 코드' },
                        customerName: { type: 'string', description: '고객명' },
                        productName: { type: 'string', description: '품목명' },
                        claimStatus: { type: 'string', description: '클레임 상태' }
                    }
                }
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
        description: '삭제 불가능한 클레임',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', description: '오류 메시지' }
            }
        }
    })
    async deleteClaim(
        @Param('id') id: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.claimDeleteService.deleteClaim(parseInt(id), username);
    }

    @Delete('bulk-delete')
    @ApiOperation({ 
        summary: '여러 클레임 일괄 삭제',
        description: '여러 클레임을 일괄로 삭제합니다.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: { 
                    type: 'array', 
                    items: { type: 'number' },
                    description: '삭제할 클레임 ID 목록',
                    example: [1, 2, 3]
                }
            },
            required: ['ids']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '일괄 삭제 완료',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                data: {
                    type: 'object',
                    properties: {
                        success: { 
                            type: 'array', 
                            description: '성공한 삭제 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    claimCode: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        },
                        failed: { 
                            type: 'array', 
                            description: '실패한 삭제 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    error: { type: 'string' }
                                }
                            }
                        },
                        total: { type: 'number', description: '전체 요청 수' }
                    }
                }
            }
        }
    })
    async deleteMultipleClaims(
        @Body() body: { ids: number[] },
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.claimDeleteService.deleteMultipleClaims(body.ids, username);
    }
}
