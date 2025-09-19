import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ShippingDownloadService } from '../services/shipping-download.service';
import { ShippingReadService } from '../services/shipping-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('출하관리 엑셀')
@Controller('shipping-info')
export class ShippingDownloadController {
    constructor(
        private readonly shippingDownloadService: ShippingDownloadService,
        private readonly shippingReadService: ShippingReadService,
    ) {}

    @Get('excel/download-excel')
    @ApiOperation({ 
        summary: '출하관리 엑셀 다운로드',
        description: '출하관리 데이터를 엑셀 파일로 다운로드합니다.'
    })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (출하코드, 품목명, 사원명 등)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명 (포함 검색)' })
    @ApiQuery({ name: 'employeeName', required: false, description: '사원명 (포함 검색)' })
    @ApiQuery({ name: 'shippingStatus', required: false, description: '출하상태 (포함 검색)' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작일 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료일 (YYYY-MM-DD)' })
    @ApiResponse({ 
        status: 200, 
        description: '출하관리 엑셀 파일이 성공적으로 다운로드되었습니다.',
    })
    async downloadExcel(@Res() res: Response, @Query() query: any) {
        try {
            const {
                keyword,
                page = 1,
                limit = 99999,
                shippingCode,
                productName,
                employeeName,
                shippingStatus,
                startDate,
                endDate
            } = query;

            let result: any;
            let searchKeyword: string | undefined;

            // 페이지네이션 파라미터 처리
            const pageNum = this.safeParseInt(page, 1);
            const limitNum = this.safeParseInt(limit, 99999);

            // 검색 조건에 따른 데이터 조회
            if (keyword && keyword.trim()) {
                searchKeyword = keyword.trim();
                result = await this.shippingReadService.getAllShipping(
                    pageNum, limitNum, 'system', searchKeyword
                );
            } else if (shippingCode && shippingCode.trim()) {
                searchKeyword = `출하코드: ${shippingCode.trim()}`;
                result = await this.shippingReadService.searchShippingByField(
                    'shippingCode', shippingCode.trim(), pageNum, limitNum, 'system', startDate, endDate
                );
            } else if (productName && productName.trim()) {
                searchKeyword = `품목명: ${productName.trim()}`;
                result = await this.shippingReadService.searchShippingByField(
                    'productName', productName.trim(), pageNum, limitNum, 'system', startDate, endDate
                );
            } else if (employeeName && employeeName.trim()) {
                searchKeyword = `사원명: ${employeeName.trim()}`;
                result = await this.shippingReadService.searchShippingByField(
                    'employeeName', employeeName.trim(), pageNum, limitNum, 'system', startDate, endDate
                );
            } else if (shippingStatus && shippingStatus.trim()) {
                searchKeyword = `출하상태: ${shippingStatus.trim()}`;
                result = await this.shippingReadService.searchShippingByField(
                    'shippingStatus', shippingStatus.trim(), pageNum, limitNum, 'system', startDate, endDate
                );
            } else if (startDate && endDate) {
                searchKeyword = `${startDate} ~ ${endDate}`;
                result = await this.shippingReadService.getAllShipping(
                    pageNum, limitNum, 'system', undefined, startDate, endDate
                );
            } else {
                result = await this.shippingReadService.getAllShipping(
                    pageNum, limitNum, 'system'
                );
            }

            // 데이터가 없으면 빈 엑셀 파일 생성
            if (!result.shipping || result.shipping.length === 0) {
                await this.shippingDownloadService.exportEmptyShippingInfos(res, searchKeyword);
                return;
            }

            // 데이터가 있으면 있는 것만 다운로드
            await this.shippingDownloadService.exportShippingInfos(result.shipping, res, searchKeyword);
            
        } catch (error) {
            // 오류 발생 시 빈 엑셀 파일 생성
            await this.shippingDownloadService.exportEmptyShippingInfos(res, '오류 발생');
        }
    }

    private safeParseInt(value: any, defaultValue: number): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}
