import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { ProductionDefectQuantity } from '../entities/productionDefect.entity';
import { Production } from '../entities/production.entity';
import { ProductionDefectReadService } from './production-defect-read.service';
import { logService } from '@/modules/log/Services/log.service';

@Injectable()
export class ProductionDefectDownloadService {
    constructor(
        @InjectRepository(ProductionDefectQuantity)
        private readonly productionDefectRepository: Repository<ProductionDefectQuantity>,
        @InjectRepository(Production)
        private readonly productionRepository: Repository<Production>,
        private readonly productionDefectReadService: ProductionDefectReadService,
        private readonly logService: logService,
    ) {}

    /**
     * 불량현황 데이터를 Excel로 다운로드합니다.
     */
    async downloadExcel(searchKeyword?: string): Promise<Buffer> {
        try {
            // 불량현황 데이터 조회
            const data = await this.getAllDefects(searchKeyword);

            // 엑셀 워크북 생성
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('불량현황');

            // 컬럼 정의
            const columns = [
                { header: '품목명', key: 'productName', width: 25 },
                { header: '품목구분', key: 'productType', width: 15 },
                { header: '불량수량', key: 'productionDefectQuantity', width: 12 },
                { header: '불량사유', key: 'productionDefectReason', width: 25 },
                { header: '사원명', key: 'employeeName', width: 15 },
                { header: '비고', key: 'remark', width: 30 },   
            ];

            worksheet.columns = columns;

            // 헤더 스타일 적용
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // 데이터 행 추가
            data.data.forEach((item) => {
                const row = worksheet.addRow({
                    productionDefectQuantity: item.productionDefectQuantity,
                    productionDefectReason: item.productionDefectReason,
                    employeeName: item.employeeName || '',
                    remark: item.remark || '',
                    productName: item.productName || '',
                    productType: item.productType || '',
                });

                // 데이터 행 스타일 적용
                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle' };
                });
            });

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 데이터 다운로드',
                action: 'DOWNLOAD_SUCCESS',
                username: 'system',
                targetId: '데이터',
                details: `불량현황 데이터 ${data.data.length}건 다운로드 완료 (검색: ${searchKeyword || '전체'})`
            });

            // 엑셀 파일을 버퍼로 변환
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer as unknown as Buffer;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 데이터 다운로드',
                action: 'DOWNLOAD_FAILED',
                username: 'system',
                targetId: '데이터',
                details: `불량현황 데이터 다운로드 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 불량현황 데이터를 조회합니다.
     */
    private async getAllDefects(searchKeyword?: string) {
        const queryBuilder = this.productionDefectRepository.createQueryBuilder('defect');

        // 검색 조건
        if (searchKeyword) {
            queryBuilder.andWhere(
                '(defect.productionDefectCode LIKE :search OR ' +
                'defect.productionDefectReason LIKE :search OR ' +
                'defect.employeeCode LIKE :search OR ' +
                'defect.employeeName LIKE :search OR ' +
                'defect.remark LIKE :search)',
                { search: `%${searchKeyword}%` }
            );
        }

        // 정렬 (최신순)
        queryBuilder.orderBy('defect.createdAt', 'DESC');

        // 모든 데이터 조회 (페이지네이션 없이)
        const defects = await queryBuilder.getMany();

        // 각 불량현황에 대해 관련 정보 조회
        const defectsWithRelatedInfo = await Promise.all(
            defects.map(async (defect) => {
                // 관련 생산 정보 조회
                const production = await this.productionRepository.findOne({
                    where: { productionDefectCode: defect.productionDefectCode }
                });

                // 관련 정보를 평면화하여 직접 추가
                const flatData = {
                    ...defect,
                    // 품목 정보
                    productCode: production?.productCode || null,
                    productName: production?.productName || null,
                    productType: production?.productType || null,
                    // 생산 정보
                    productionCode: production?.productionCode || null,
                    productionStatus: production?.productionStatus || null,
                    productionInstructionQuantity: production?.productionInstructionQuantity || null,
                    productionCompletionQuantity: production?.productionCompletionQuantity || null
                };

                return flatData;
            })
        );

        return {
            data: defectsWithRelatedInfo,
            total: defectsWithRelatedInfo.length
        };
    }
}
