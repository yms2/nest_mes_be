import { Controller, Get, Post, Query, Res, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ClaimDownloadService } from '../services/claim-download.service';
import { ClaimUploadService } from '../services/claim-upload.service';
import { ClaimReadService } from '../services/claim-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('AS 클레임 엑셀')
@Controller('claim/excel')
@DevAuth()
export class ClaimExcelController {
    constructor(
        private readonly claimDownloadService: ClaimDownloadService,
        private readonly claimUploadService: ClaimUploadService,
        private readonly claimReadService: ClaimReadService,
    ) {}

    @Get('download-template')
    @ApiOperation({
        summary: '클레임 등록 템플릿 다운로드',
        description: '클레임 등록을 위한 엑셀 템플릿을 다운로드합니다.'
    })
    @ApiResponse({ status: 200, description: '템플릿 다운로드 성공' })
    async downloadTemplate(@Res() res: Response) {
        await this.claimDownloadService.downloadTemplate(res);
    }

    @Get('download-excel')
    @ApiOperation({
        summary: '클레임 데이터 엑셀 다운로드',
        description: '클레임 목록을 엑셀 파일로 다운로드합니다. 검색 조건에 따라 필터링된 결과를 다운로드할 수 있습니다.'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'search', required: false, description: '검색어 (클레임코드, 거래처명, 품목명, 프로젝트명, 클레임사유)' })
    @ApiQuery({ name: 'claimStatus', required: false, description: '클레임 상태', enum: ['접수', '처리중', '완료', '취소'] })
    @ApiQuery({ name: 'customerName', required: false, description: '고객명' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: '엑셀 다운로드 성공' })
    async downloadExcel(
        @Res() res: Response,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('claimStatus') claimStatus?: string,
        @Query('customerName') customerName?: string,
        @Query('productName') productName?: string,
        @Query('projectName') projectName?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Req() req?: Request & { user: { username: string } }
    ) {
        try {
            const username = req?.user?.username || 'unknown';
            const pageNum = page ? parseInt(page) : 1;
            const limitNum = limit ? parseInt(limit) : 99999;

            // 클레임 데이터 조회
            const result = await this.claimReadService.getAllClaims(
                pageNum,
                limitNum,
                search,
                claimStatus,
                customerName,
                productName,
                projectName,
                startDate,
                endDate,
                username
            );

            // 엑셀 파일 다운로드
            await this.claimDownloadService.exportClaims(result.data.claims, res, search);

        } catch (error) {
            res.status(500).json({
                success: false,
                message: '엑셀 다운로드 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: '클레임 데이터 엑셀 업로드',
        description: '엑셀 파일을 통해 클레임 데이터를 일괄 등록합니다. 템플릿을 다운로드하여 사용하세요.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '클레임 엑셀 파일',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '클레임 엑셀 파일 (.xlsx, .xls)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: '업로드 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '클레임 업로드 완료: 성공 5개, 실패 0개' },
                data: {
                    type: 'object',
                    properties: {
                        success: { type: 'number', description: '성공한 건수' },
                        failed: { type: 'number', description: '실패한 건수' },
                        errors: {
                            type: 'array',
                            description: '실패한 행의 오류 정보',
                            items: {
                                type: 'object',
                                properties: {
                                    row: { type: 'number', description: '행 번호' },
                                    error: { type: 'string', description: '오류 메시지' },
                                    data: { type: 'object', description: '해당 행의 데이터' }
                                }
                            }
                        },
                        totalProcessed: { type: 'number', description: '전체 처리된 건수' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '업로드 실패 - 파일 형식이나 데이터 오류',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' },
                data: { type: 'null' }
            }
        }
    })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request & { user: { username: string } }
    ) {
        try {
            if (!file) {
                throw new BadRequestException('파일이 업로드되지 않았습니다.');
            }

            if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
                throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }

            const username = req.user?.username || 'unknown';
            const result = await this.claimUploadService.uploadClaims(file, username);

            return {
                success: true,
                message: `클레임 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
                data: {
                    success: result.success,
                    failed: result.failed,
                    errors: result.errors,
                    totalProcessed: result.success + result.failed
                }
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }
}
