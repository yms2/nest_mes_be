import { BadRequestException, Controller, Get, Post, Query, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { OrderManagementReadService } from "../../services/ordermanagement-read.service";
import { OrderManagementTemplateService } from "../../services/ordermanagement-template.service";
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { ApiTags } from "@nestjs/swagger";
import { OrderManagementDownloadService } from "../../services/ordermanagement-download.service";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { OrderManagementUploadService } from "../../services/ordermanagement-upload.service";

@Auth()
@ApiTags('수주관리 엑셀')
@Controller('ordermanagement-info')

export class OrderManagementExcelController {
    constructor(
        private readonly orderManagementReadService: OrderManagementReadService,
        private readonly orderManagementDownloadService: OrderManagementDownloadService,
        private readonly orderManagementUploadService: OrderManagementUploadService,
    ) {}

    @Get('download-excel')
    @ApiOperation({ summary: '수주관리 엑셀 다운로드 (데이터 없으면 빈값, 있으면 있는 것만)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'orderCode', required: false, description: '수주코드 (포함 검색)' })
    @ApiQuery({ name: 'orderDate', required: false, description: '수주일 (포함 검색)' })
    @ApiQuery({ name: 'customerName', required: false, description: '거래처명 (포함 검색)' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명 (포함 검색)' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명 (포함 검색)' })
    @ApiQuery({ name: 'orderType', required: false, description: '수주구분 (포함 검색)' })
    async downloadExcel(
        @Res() res: Response,
        @Query() query: any,
    ) {
        try {
            const { keyword, page, limit, orderCode, orderDate, customerName, projectName, productName, orderType } = query;
            const pageNum = page ? parseInt(page) : 1;
            const limitNum = limit ? parseInt(limit) : 99999;

            let result;
            let searchKeyword = '';

            if (keyword && keyword.trim()) {
                searchKeyword = keyword.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (orderCode && orderCode.trim()) {
                searchKeyword = orderCode.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (orderDate && orderDate.trim()) {
                searchKeyword = orderDate.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (customerName && customerName.trim()) {
                searchKeyword = customerName.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (projectName && projectName.trim()) {
                searchKeyword = projectName.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (productName && productName.trim()) {
                searchKeyword = productName.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else if (orderType && orderType.trim()) {
                searchKeyword = orderType.trim();
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system', searchKeyword);
            } else {
                result = await this.orderManagementReadService.getAllOrderManagement(1, 99999, 'system');
            }

            // 데이터가 없으면 빈 엑셀 파일 생성
            if (!result.orderManagement || result.orderManagement.length === 0) {
                await this.orderManagementDownloadService.exportEmptyOrderManagementInfos(res, searchKeyword);
                return;
            }

            // 데이터가 있으면 있는 것만 다운로드
            await this.orderManagementDownloadService.exportOrderManagementInfos(result.orderManagement, res, searchKeyword);
            
        } catch (error) {
            // 오류 발생 시 빈 엑셀 파일 생성
            await this.orderManagementDownloadService.exportEmptyOrderManagementInfos(res, '오류 발생');
        }
    }

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '견적관리 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '견적관리 엑셀 파일',
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request & { user: { username: string } }
    ) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.'); 
        }

        if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
            throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        }

        const result = await this.orderManagementUploadService.uploadOrderManagement(file, req.user.username);

        if (!result) {
            throw new BadRequestException('업로드 처리 중 오류가 발생했습니다.');
        }

        return {
            success: true,
            message: `수주관리 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
            data: {
                success: result.success,
                failed: result.failed,
                errors: result.errors,
                totalProcessed: result.success + result.failed
            }
        };
    }
}