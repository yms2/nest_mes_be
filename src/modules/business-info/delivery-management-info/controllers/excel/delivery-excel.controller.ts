import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DeliveryTemplateService } from '../../services/delivery-template.service';
import { DeliveryReadService } from '../../services/delivery-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { DeliveryDownloadService } from '../../services/delivery-download.service';
import { DeliveryUploadService } from '../../services/delivery-upload.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@DevAuth()
@ApiTags('납품관리 엑셀')
@Controller('delivery-info')
export class DeliveryExcelController {
    constructor(
        private readonly deliveryTemplateService: DeliveryTemplateService,
        private readonly deliveryReadService: DeliveryReadService,
        private readonly deliveryDownloadService: DeliveryDownloadService,
        private readonly deliveryUploadService: DeliveryUploadService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '납품관리 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.deliveryTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('납품관리 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({ summary: '납품관리 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'deliveryCode', required: false, description: '납품코드 (포함 검색)' })
    @ApiQuery({ name: 'deliveryDate', required: false, description: '납품일 (포함 검색)' })
    @ApiQuery({ name: 'customerName', required: false, description: '거래처명 (포함 검색)' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명 (포함 검색)' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명 (포함 검색)' })
    @ApiQuery({ name: 'deliveryStatus', required: false, description: '납품상태 (포함 검색)' })
    async downloadExcel(
        @Res() res: Response,
        @Query() query: any,
    ) {
        const { keyword, page, limit, deliveryCode, deliveryDate, customerName, productName, projectName, deliveryStatus } = query;
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;

        let result;

        if (keyword && keyword.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, keyword.trim());
        } else if (deliveryCode && deliveryCode.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, { search: deliveryCode.trim() });
        } else if (deliveryDate && deliveryDate.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, { search: deliveryDate.trim() });
        }
        else if (customerName && customerName.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, { customerName: customerName.trim() });
        } else if (productName && productName.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, { productName: productName.trim() });
        } else if (projectName && projectName.trim()) {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999, { projectName: projectName.trim() });
        } else {
            result = await this.deliveryReadService.getAllDeliveries(1, 99999);
        }

        await this.deliveryDownloadService.exportDeliveryInfos(result.deliveries, res, keyword);
    }

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '납품관리 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '납품관리 엑셀 파일 업로드',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '납품관리 엑셀 파일 (.xlsx, .xls)'
                }
            },
            required: ['file']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '엑셀 파일이 성공적으로 업로드되었습니다.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        success: { type: 'number', description: '성공한 건수' },
                        failed: { type: 'number', description: '실패한 건수' },
                        errors: { 
                            type: 'array', 
                            items: { type: 'string' },
                            description: '오류 메시지 목록'
                        },
                        totalProcessed: { type: 'number', description: '총 처리 건수' }
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
        @Request() req: any
    ) {
        try {
            if (!file) {
                return ApiResponseBuilder.error('파일이 선택되지 않았습니다.', 400);
            }

            if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
                return ApiResponseBuilder.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.', 400);
            }

            const username = req.user?.username || 'system';
            const result = await this.deliveryUploadService.uploadDeliveriesFromExcel(file, username);

            return ApiResponseBuilder.success({
                success: result.success,
                failed: result.failed,
                errors: result.errors,
                totalProcessed: result.success + result.failed
            }, `엑셀 업로드가 완료되었습니다. 성공: ${result.success}건, 실패: ${result.failed}건`);

        } catch (error) {
            return ApiResponseBuilder.error(error.message, error.status || 500);
        }
    }
}