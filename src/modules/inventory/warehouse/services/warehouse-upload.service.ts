import { Injectable } from '@nestjs/common';
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

    async uploadWarehouseData(file: Express.Multer.File, username: string = 'system') {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);
            
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new Error('엑셀 파일에 워크시트가 없습니다.');
            }

            // 헤더 검증
            this.validateHeaders(worksheet);

            const results = {
                success: 0,
                failed: 0,
                errors: [] as string[],
                details: [] as any[]
            };

            // 데이터 행 처리 (헤더 제외)
            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                
                if (this.isEmptyRow(row)) {
                    continue;
                }

                try {
                    const warehouseData = this.parseRowData(row, rowNumber);
                    const validationResult = this.validateWarehouseData(warehouseData, rowNumber);
                    
                    if (!validationResult.isValid) {
                        results.failed++;
                        results.errors.push(`행 ${rowNumber}: ${validationResult.errors.join(', ')}`);
                        results.details.push({
                            row: rowNumber,
                            status: 'failed',
                            errors: validationResult.errors,
                            data: warehouseData
                        });
                        continue;
                    }

                    // 창고 데이터 저장
                    await this.saveWarehouseData(warehouseData, username);
                    results.success++;
                    results.details.push({
                        row: rowNumber,
                        status: 'success',
                        data: warehouseData
                    });

                } catch (error) {
                    results.failed++;
                    const errorMessage = `행 ${rowNumber}: ${error.message}`;
                    results.errors.push(errorMessage);
                    results.details.push({
                        row: rowNumber,
                        status: 'failed',
                        errors: [error.message],
                        data: null
                    });
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '창고관리 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: '창고 데이터 업로드',
                details: `창고 데이터 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });

            return results;

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '창고관리 업로드',
                action: 'UPLOAD_FAILED',
                username,
                targetId: '',
                targetName: '창고 데이터 업로드',
                details: `창고 데이터 업로드 실패: ${error.message}`,
            });
            throw error;
        }
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet) {
        const expectedHeaders = ['창고명', '창고위치', '창고비고'];
        const actualHeaders: string[] = [];
        
        for (let col = 1; col <= expectedHeaders.length; col++) {
            const cell = worksheet.getCell(1, col);
            actualHeaders.push(cell.value?.toString() || '');
        }

        for (let i = 0; i < expectedHeaders.length; i++) {
            if (actualHeaders[i] !== expectedHeaders[i]) {
                throw new Error(`헤더가 올바르지 않습니다. 예상: ${expectedHeaders[i]}, 실제: ${actualHeaders[i]}`);
            }
        }
    }

    private isEmptyRow(row: ExcelJS.Row): boolean {
        for (let col = 1; col <= 3; col++) {
            const cell = row.getCell(col);
            if (cell.value !== null && cell.value !== undefined && cell.value.toString().trim() !== '') {
                return false;
            }
        }
        return true;
    }

    private parseRowData(row: ExcelJS.Row, rowNumber: number) {
        return {
            warehouseName: this.getStringValue(row.getCell(1), rowNumber, '창고명'),
            warehouseLocation: this.getStringValue(row.getCell(2), rowNumber, '창고위치'),
            warehouseBigo: this.getStringValue(row.getCell(3), rowNumber, '창고비고'),
        };
    }

    private getStringValue(cell: ExcelJS.Cell, rowNumber: number, fieldName: string): string {
        if (cell.value === null || cell.value === undefined) {
            return '';
        }
        return cell.value.toString().trim();
    }

    private validateWarehouseData(data: any, rowNumber: number) {
        const errors: string[] = [];

        // 필수 필드 검증
        if (!data.warehouseName || data.warehouseName.trim() === '') {
            errors.push('창고명은 필수입니다');
        }

        // 창고명 중복 검증 (기존 데이터와 비교)
        // 이 부분은 실제 저장 시에 처리

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private async saveWarehouseData(data: any, username: string) {
        // 창고 코드 생성 (자동 생성)
        const warehouseCode = await this.generateWarehouseCode();
        
        // 창고명 중복 검증
        const existingWarehouse = await this.warehouseRepository.findOne({
            where: { warehouseName: data.warehouseName }
        });

        if (existingWarehouse) {
            throw new Error(`창고명 '${data.warehouseName}'이 이미 존재합니다`);
        }

        // 창고 데이터 생성
        const warehouse = this.warehouseRepository.create({
            warehouseCode,
            warehouseName: data.warehouseName,
            warehouseLocation: data.warehouseLocation || null,
            warehouseBigo: data.warehouseBigo || null,
        });

        await this.warehouseRepository.save(warehouse);
    }

    private async generateWarehouseCode(): Promise<string> {
        const count = await this.warehouseRepository.count();
        const nextNumber = count + 1;
        return `WHS${nextNumber.toString().padStart(3, '0')}`;
    }
}
