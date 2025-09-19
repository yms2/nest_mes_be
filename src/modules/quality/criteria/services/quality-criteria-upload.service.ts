import { InjectRepository } from "@nestjs/typeorm";
import { QualityCriteria } from "../entities/quality-criteria.entity";
import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';
import { logService } from "@/modules/log/Services/log.service";

@Injectable()
export class QualityCriteriaUploadService {
    constructor(
        @InjectRepository(QualityCriteria)
        private readonly qualityCriteriaRepository: Repository<QualityCriteria>,
        private readonly logService: logService,
    ) {}

    private isEmptyRow(row: ExcelJS.Row): boolean {
        const values = row.values as any[];
        return !values || values.length <= 1 || values.slice(1).every(val => val === undefined || val === null || val === '');
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet): void {
        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values as any[];

        if(!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
    }

    private parseRowData(row: ExcelJS.Row, rowIndex: number): any {
        const values = row.values as any[];
        
        return {
            criteriaName: values[1] ? values[1].toString().trim() : '',
            criteriaType: values[2] ? values[2].toString().trim() : '',
            criteriaDescription: values[3] ? values[3].toString().trim() : '',
        };
    }

    private async generateQualityCriteriaCode(): Promise<string> {
        const count = await this.qualityCriteriaRepository
            .createQueryBuilder('criteria')
            .where('criteria.criteriaCode LIKE :pattern', { pattern: 'CRI%' })
            .getCount();

        const sequence = (count + 1).toString().padStart(3, '0');
        return `CRI${sequence}`;
    }

    async uploadQualityCriteria(file: Express.Multer.File, username: string) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(Buffer.from(file.buffer));

            let worksheet = workbook.getWorksheet('품질기준정보양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('품ㅇ질기준정보');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet('Sheet1');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet(0); // 첫 번째 시트
            }
            if (!worksheet) {
                throw new BadRequestException('엑셀 파일에 워크시트가 없습니다.');
            }

            this.validateHeaders(worksheet);

            const results = {
                success: 0,
                failed: 0,
                errors: [] as string[],
                data: [] as any[]
            };

            // 헤더 행 건너뛰고 데이터 행부터 처리
            let rowIndex = 2; // 1행은 헤더, 2행부터 데이터
            const totalRows = worksheet.rowCount;

            for (let i = rowIndex; i <= totalRows; i++) {
                const row = worksheet.getRow(i);
            
                if (this.isEmptyRow(row)) {
                    continue;
                }
                
                try {
                    const qualityCriteriaData = this.parseRowData(row, i);

                    // 품질기준코드 자동 생성
                    qualityCriteriaData.criteriaCode = await this.generateQualityCriteriaCode();

                    // 데이터 검증
                    if(!qualityCriteriaData.criteriaName || qualityCriteriaData.criteriaName.trim() === '') {
                        throw new BadRequestException(`${i}행: 품질기준명이 비어있습니다.`);
                    }
                    if(!qualityCriteriaData.criteriaType || qualityCriteriaData.criteriaType.trim() === '') {
                        throw new BadRequestException(`${i}행: 품질기준타입이 비어있습니다.`);
                    }

                    // 데이터베이스에 저장
                    const newQualityCriteria = this.qualityCriteriaRepository.create({
                        ...qualityCriteriaData,
                        createdBy: username,
                        updatedBy: username,
                    });

                    const savedQualityCriteria = await this.qualityCriteriaRepository.save(newQualityCriteria);
                    
                    results.success++;
                    results.data.push(savedQualityCriteria);

                } catch (error) {
                    results.failed++;
                    results.errors.push(`${i}행: ${error.message}`);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '품질기준정보 업로드',
                action: 'UPLOAD_SUCCESS',
                username: username,
                targetId: '',
                targetName: file.originalname,
                details: `성공: ${results.success}건, 실패: ${results.failed}건`,
            });

            return {
                success: true,
                message: '품질기준정보 업로드 완료',
                results: results,
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질기준정보 업로드',
                action: 'UPLOAD_FAIL',
                username: username,
                targetId: '',
                targetName: file.originalname,
                details: '품질기준정보 업로드 실패',
            });

            return {
                success: false,
                message: '품질기준정보 업로드 실패',
                error: error.message,
            };
        }
    }
}