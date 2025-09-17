import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionPlan } from '../entities/production-plan.entity';
import { logService } from '@/modules/log/Services/log.service';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { CustomerInfo } from '@/modules/base-info/customer-info/entities/customer-info.entity';
import * as ExcelJS from 'exceljs';
import { ProductionPlanCodeGenerator } from '../utils/production-plan-code-generator.util';


@Injectable()
export class ProductionUploadService {
    constructor(
        @InjectRepository(ProductionPlan)
        private readonly productionRepository: Repository<ProductionPlan>,
        private readonly logService: logService,
        @InjectRepository(ProductInfo)
        private readonly productInfoRepository: Repository<ProductInfo>,
        @InjectRepository(CustomerInfo)
        private readonly customerInfoRepository: Repository<CustomerInfo>,
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
    
    async uploadProductionPlan(file: Express.Multer.File, username: string) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            
            let worksheet = workbook.getWorksheet('생산계획양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('생산계획');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet('Sheet1');
            }
            if (!worksheet) {
                worksheet = workbook.getWorksheet(0); // 첫 번째 시트
            }
            if (!worksheet) {
                // 사용 가능한 시트 목록 출력
                const sheetNames = workbook.worksheets.map(ws => ws.name);
                throw new BadRequestException(`생산계획 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
            }
            

            // 헤더 검증
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

            for (let rowNumber = rowIndex; rowNumber <= totalRows; rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                
                if (this.isEmptyRow(row)) {
                    continue;
                }

                try {
                    const productionData = this.parseRowData(row, rowNumber);

                    // 생산계획코드 자동 생성
                    productionData.productionPlanCode = await this.generateProductionPlanCode();

                    // 고객명으로 고객코드 조회
                    if (productionData.customerName) {
                        productionData.customerCode = await this.getCustomerCodeByName(productionData.customerName);
                    }
                    
                    // 품목명으로 품목코드 조회
                    if (productionData.productName) {
                        productionData.productCode = await this.getProductCodeByName(productionData.productName);
                    }
                    
                    // 데이터 검증
                    this.validateProductionData(productionData, rowNumber);


                    
                    // 생산계획 데이터 생성
                    const productionPlan = this.productionRepository.create(
                        productionData);
                    const savedProductionPlan = await this.productionRepository.save(productionPlan);
                    
                    results.success++;
                    results.data.push(savedProductionPlan);

                } catch (error) {
                    results.failed++;
                    const errorMessage = `행 ${rowNumber}: ${error.message}`;
                    results.errors.push(errorMessage);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `생산계획 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });

            return results;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 업로드',
                action: 'UPLOAD_FAIL',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `생산계획 업로드 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }
    
    private getStringValue(value: any): string {
        if (value === undefined || value === null) return '';
        return String(value).trim();
    }

    private getNumberValue(value: any): number {
        if (value === undefined || value === null || value === '') return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    private getDateValue(value: any): Date {
        if (value === undefined || value === null || value === '') {
            return new Date();
        }
        
        // 엑셀 날짜 숫자인 경우
        if (typeof value === 'number') {
            return new Date((value - 25569) * 86400 * 1000);
        }
        
        // 문자열인 경우
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? new Date() : date;
        }
        
        return new Date();
    }

    private async generateProductionPlanCode(): Promise<string> {
        return await ProductionPlanCodeGenerator.generateProductionPlanCode(this.productionRepository);

    }
    
    private parseRowData(row: ExcelJS.Row, rowIndex: number): any {
        const values = row.values as any[];
        
        return {
            productionPlanCode: '', // 자동 생성
            productionPlanDate: this.getDateValue(values[1]),
            orderType: this.getStringValue(values[2]),
            projectCode: '', // 자동 생성
            projectName: this.getStringValue(values[3]),
            customerCode: '', // 자동 조회
            customerName: this.getStringValue(values[4]),
            productCode: '', // 자동 조회
            productName: this.getStringValue(values[5]), // 품목명
            productType: this.getStringValue(values[6]),
            productSize: this.getStringValue(values[7]),
            productStock: this.getNumberValue(values[8]),
            productionPlanQuantity: this.getNumberValue(values[9]), // 수량 컬럼
            expectedProductStock: this.getNumberValue(values[10]),
            expectedStartDate: this.getDateValue(values[12]),
            expectedCompletionDate: this.getDateValue(values[13]),
            employeeCode: '', // 자동 생성
            employeeName: this.getStringValue(values[14]),
            shortageQuantity: this.getNumberValue(values[11]),
            remark: this.getStringValue(values[15]),
        };
    }

    private async getCustomerCodeByName(customerName: string): Promise<string> {
        try {
            const customer = await this.customerInfoRepository.findOne({
                where: { customerName: customerName.trim() }
            });
            
            if (!customer) {
                throw new BadRequestException(`거래처 정보를 찾을 수 없습니다: ${customerName}`);
            }
            
            return customer.customerCode;
            
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`고객 정보 조회 중 오류가 발생했습니다: ${customerName}`);
        }
    }

    private async getProductCodeByName(productName: string): Promise<string> {
        try {
            const product = await this.productInfoRepository.findOne({
                where: { productName: productName.trim() }
            });
            
            if (!product) {
                throw new BadRequestException(`품목 정보를 찾을 수 없습니다: ${productName}`);
            }
            
            return product.productCode;
            
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`품목 정보 조회 중 오류가 발생했습니다: ${productName}`);
        }
    }

    private validateProductionData(data: any, rowNumber: number): void {
        if (!data.productionPlanDate) {
            throw new BadRequestException(`행 ${rowNumber}: 생산계획일은 필수입니다.`);
        }
        
        if (!data.productName) {
            throw new BadRequestException(`행 ${rowNumber}: 품목명은 필수입니다.`);
        }
        
        if (!data.productionPlanQuantity || data.productionPlanQuantity <= 0) {
            throw new BadRequestException(`행 ${rowNumber}: 생산계획수량은 0보다 큰 값이어야 합니다.`);
        }
        
        if (data.expectedStartDate && data.expectedCompletionDate) {
            if (data.expectedStartDate > data.expectedCompletionDate) {
                throw new BadRequestException(`행 ${rowNumber}: 예상 시작일은 완료일보다 이전이어야 합니다.`);
            }
        }
    }
   
    
}