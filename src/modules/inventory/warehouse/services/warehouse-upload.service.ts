import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Warehouse } from '../entities/warehouse.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class WarehouseUploadService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
        private readonly logService: logService,
    ) {}

    private isEmptyRow(row: ExcelJS.Row): boolean {
        const values = row.values as any[];
        return !values || values.length <= 1 || values.slice(1).every(val => val === undefined || val === null || val === '');
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet): void {
        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values as any[];

        if (!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
    }

    async uploadWarehouse(file: Express.Multer.File, username: string) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);

            let worksheet = workbook.getWorksheet('창고관리양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('창고관리');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet('Sheet1');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet(0);
            }
            if (!worksheet) {
                const sheetNames = workbook.worksheets.map(ws => ws.name);
                throw new BadRequestException(`창고관리 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
            }

            this.validateHeaders(worksheet);

            const results = {
                success: 0,
                failed: 0,
                errors: [] as string[],
                data: [] as any[]
            };
            
            let rowIndex = 2;
            const totalRows = worksheet.rowCount;

            for (let i = rowIndex; i <= totalRows; i++) {
                const row = worksheet.getRow(i);

                if (this.isEmptyRow(row)) {
                    continue;
                }

                try {
                    const warehouseData = this.parseRowData(row, i);
                    
                    // 필수 필드 검증
                    if (!warehouseData.warehouseName) {
                        throw new Error('창고명은 필수입니다.');
                    }

                    // 창고 생성
                    const warehouse = await this.createWarehouse(warehouseData, username);
                    results.success++;
                    results.data.push(warehouse);
                }
                catch (error) {
                    results.failed++;
                    results.errors.push(`${i}행: ${error.message}`);
                    continue;
                }
            }

            await this.logService.createDetailedLog({
                moduleName: '창고관리 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `창고관리 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });
            return results;
            
        }
        catch (error) {
            throw new Error('창고관리 엑셀 파일 업로드 중 오류가 발생했습니다.');
        }
    }

    private getStringValue(value: any): string {
        if (value === undefined || value === null) return '';
        return String(value).trim();
    }

    private parseRowData(row: ExcelJS.Row, rowIndex: number): any {
        const values = row.values as any[];
        
        // 엑셀 컬럼 순서에 맞게 데이터 추출 (창고관리 양식)
        const warehouseData = {
            warehouseName: this.getStringValue(values[1]), // A열: 창고명
            warehouseLocation: this.getStringValue(values[2]), // B열: 창고위치
            warehouseBigo: this.getStringValue(values[3]), // C열: 창고비고
        };

        return warehouseData;
    }

    private async createWarehouse(warehouseData: any, createdBy: string): Promise<Warehouse> {
        // 창고 코드 생성
        const warehouseCode = await this.generateWarehouseCode();
        
        // 창고 엔티티 생성
        const warehouse = this.warehouseRepository.create({
            warehouseCode,
            warehouseName: warehouseData.warehouseName,
            warehouseLocation: warehouseData.warehouseLocation,
            warehouseBigo: warehouseData.warehouseBigo,
            createdBy,
        });

        return this.warehouseRepository.save(warehouse);
    }

    private async generateWarehouseCode(): Promise<string> {
        const [lastWarehouse] = await this.warehouseRepository.find({
            order: { warehouseCode: 'DESC' },
            take: 1,
        });
        const nextNumber = lastWarehouse?.warehouseCode
            ? parseInt(lastWarehouse.warehouseCode.slice(2), 10) + 1
            : 1;
        return `WH${nextNumber.toString().padStart(3, '0')}`;
    }


}
