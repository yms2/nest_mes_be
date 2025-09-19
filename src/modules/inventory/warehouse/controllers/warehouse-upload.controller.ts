import { Controller, Post, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { WarehouseUploadService } from '../services/warehouse-upload.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import * as multer from 'multer';

@DevAuth()
@ApiTags('창고관리 엑셀')
@Controller('warehouse')
export class WarehouseUploadController {
    constructor(
        private readonly warehouseUploadService: WarehouseUploadService,
    ) {}

    @Post('excel/upload-excel')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            // 한글 파일명을 제대로 처리하기 위한 설정
            if (file.originalname) {
                try {
                    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
                } catch (error) {
                    console.warn('파일명 디코딩 실패:', error);
                }
            }
            cb(null, true);
        },
    }))
    @ApiOperation({ 
        summary: '창고관리 엑셀 업로드',
        description: '엑셀 파일을 업로드하여 창고 데이터를 일괄 등록합니다.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '엑셀 파일 업로드',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 엑셀 파일 (.xlsx, .xls)'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '엑셀 파일이 성공적으로 업로드되었습니다.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'number', description: '성공한 행 수' },
                failed: { type: 'number', description: '실패한 행 수' },
                errors: { type: 'array', items: { type: 'string' }, description: '에러 메시지 목록' },
                details: { type: 'array', description: '상세 결과' }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: '잘못된 요청 (파일이 없거나 형식이 잘못됨)'
    })
    async uploadExcel(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        try {
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: '파일이 업로드되지 않았습니다.'
                });
            }

            // 파일 확장자 검증
            const allowedExtensions = ['.xlsx', '.xls'];
            const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
            
            if (!allowedExtensions.includes(fileExtension)) {
                return res.status(400).json({
                    success: false,
                    message: '지원하지 않는 파일 형식입니다. .xlsx 또는 .xls 파일을 업로드해주세요.'
                });
            }

            // 업로드 서비스 호출
            const result = await this.warehouseUploadService.uploadWarehouseData(file, 'system');

            return res.status(200).json({
                success: true,
                message: '엑셀 파일이 성공적으로 업로드되었습니다.',
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: '엑셀 파일 업로드 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
}
