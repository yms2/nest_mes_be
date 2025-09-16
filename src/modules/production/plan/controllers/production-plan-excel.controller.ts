import { BadRequestException, Controller, Get, Post, Query, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { ProductionPlanReadService } from "../services/production-plan-read.service";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { ProductionPlanDownloadService } from "../services/production-plan-download.service";
import { QueryProductionPlanDto } from "../dto/query-production-plan.dto";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductionUploadService } from "../services/production-upload.service";
import { logService } from "@/modules/log/Services/log.service";


@DevAuth()
@ApiTags('생산계획 엑셀')
@Controller('production-plan')

export class ProductionPlanExcelController {
    constructor(
        private readonly productionPlanReadService: ProductionPlanReadService,
        private readonly productionPlanDownloadService: ProductionPlanDownloadService,
        private readonly productionPlanUploadService: ProductionUploadService,
        private readonly logService: logService,
    ){}

    @Get('download-excel')
    @ApiOperation({ summary: '생산계획 엑셀 다운로드' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'productionPlanDate', required: false, description: '생산계획일 (포함 검색)' })
    @ApiQuery({ name: 'orderType', required: false, description: '신규,A/S 구분 (포함 검색)' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명 (포함 검색)' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명 (포함 검색)' })
    @ApiQuery({ name: 'employeeName', required: false, description: '담당자명 (포함 검색)' })


    async downloadExcel(
        @Res() res: Response,
        @Query() query: any,
        @Req() req: Request & { user: { username: string } },
    ) {
        try {
            const { keyword, page, limit, productionPlanDate, orderType, projectName, productName, employeeName } = query;
            const pageNum = page ? parseInt(page) : 1;
            const limitNum = limit ? parseInt(limit) : 99999;

            // 검색 조건을 QueryProductionPlanDto 형태로 구성
            const searchQuery: QueryProductionPlanDto = {
                page: 1,
                limit: 99999,
                productName: productName || undefined,
                projectName: projectName || undefined,
                customerName: undefined,
                employeeName: employeeName || undefined,
                productionPlanDateFrom: productionPlanDate || undefined,
                productionPlanDateTo: undefined,
                expectedStartDateFrom: undefined,
                expectedStartDateTo: undefined,
                expectedCompletionDateFrom: undefined,
                expectedCompletionDateTo: undefined,
            };

            let result;
            let searchKeyword = '';

            // 키워드 검색이 있는 경우
            if (keyword && keyword.trim()) {
                searchKeyword = keyword.trim();
                // 키워드로 모든 필드에서 검색 (품목명 우선)
                searchQuery.productName = keyword.trim();
            }

            result = await this.productionPlanReadService.getAllProductionPlan(1, 99999, searchQuery);

            if (!result.data || result.data.length === 0) {
                await this.productionPlanDownloadService.exportEmptyProductionPlanInfos(res, searchKeyword);
                
                // 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: '생산계획 엑셀',
                    action: 'DOWNLOAD_EMPTY',
                    username: req.user.username,
                    targetId: '',
                    targetName: '생산계획 엑셀 다운로드',
                    details: '검색 결과가 없어 빈 엑셀 파일을 다운로드했습니다.',
                });
                return;
            }

            await this.productionPlanDownloadService.exportProductionPlanInfos(result.data, res, searchKeyword);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'DOWNLOAD_SUCCESS',
                username: req.user.username,
                targetId: '',
                targetName: '생산계획 엑셀 다운로드',
                details: `${result.data.length}개의 생산계획을 엑셀로 다운로드했습니다.`,
            });
        } catch (error) {
            await this.productionPlanDownloadService.exportEmptyProductionPlanInfos(res, '오류 발생');

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'DOWNLOAD_FAIL',
                username: req.user.username,
                targetId: '',
                targetName: '생산계획 엑셀 다운로드',
                details: `엑셀 다운로드 실패: ${error.message}`,
            }).catch(() => {});
        }
    }
    
    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '생산계획 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '생산계획 엑셀 파일',
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
        try {
            if (!file) {
                throw new BadRequestException('파일이 업로드되지 않았습니다.');
            }

            if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
                throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }

            const result = await this.productionPlanUploadService.uploadProductionPlan(file, req.user.username);

            if (!result) {
                throw new BadRequestException('업로드 처리 중 오류가 발생했습니다.');
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'UPLOAD_SUCCESS',
                username: req.user.username,
                targetId: '',
                targetName: file.originalname,
                details: `생산계획 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
            });

            return {
                success: true,
                message: `생산계획 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
                data: {
                    success: result.success,
                    failed: result.failed,
                    errors: result.errors,
                    totalProcessed: result.success + result.failed
                }
            };
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'UPLOAD_FAIL',
                username: req.user.username,
                targetId: '',
                targetName: file?.originalname || '알 수 없는 파일',
                details: `생산계획 업로드 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }
}
