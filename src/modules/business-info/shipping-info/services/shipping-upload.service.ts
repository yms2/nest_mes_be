import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Shipping } from '../entities/shipping.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { Employee } from '../../../base-info/employee-info/entities/employee.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { ShippingCreationHandler } from '../handlers/shipping-creation.handler';

@Injectable()
export class ShippingUploadService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        @InjectRepository(ProductInfo)
        private readonly productRepository: Repository<ProductInfo>,
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
        private readonly logService: logService,
        private readonly shippingCreationHandler: ShippingCreationHandler,
    ) {}

    private isEmptyRow(row: ExcelJS.Row): boolean {
        const values = row.values as any[];
        return !values || values.length <= 1 || values.slice(1).every(val => val === undefined || val === null || val === '');
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet): void {
        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values as any[];
        
        // 예상되는 헤더들
        const expectedHeaders = [
            '출하일자', '품목명', '출하 지시 수량', '사원명', '비고'
        ];
        
        // 첫 번째 셀이 비어있으면 헤더가 없다고 판단
        if (!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
        
        // 헤더가 예상과 다르면 경고만 출력 (엄격하지 않게)
        const actualHeaders = headers.slice(1).map(h => String(h).trim());
    }

    async uploadShipping(file: Express.Multer.File, username: string) {
        try {
            // 엑셀 파일 읽기
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);

            // 시트 찾기 (여러 시트명 시도)
            let worksheet = workbook.getWorksheet('출하관리양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('출하관리');
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
                throw new BadRequestException(`출하관리 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
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

            for (let i = rowIndex; i <= totalRows; i++) {
                const row = worksheet.getRow(i);

                // 빈 행 건너뛰기
                if (this.isEmptyRow(row)) {
                    continue;
                }
                try {
                    const shippingData = this.parseRowData(row, i);

                    // 출하코드 자동 생성
                    shippingData.shippingCode = await this.shippingCreationHandler.generateShippingCode(this.shippingRepository);

                    // 품목명으로 품목 정보 조회
                    if (shippingData.productName) {
                        const productInfo = await this.getProductInfoByName(shippingData.productName);
                        if (productInfo) {
                            shippingData.productCode = productInfo.productCode;
                            shippingData.unit = productInfo.productInventoryUnit;
                        }
                    }

                    // 사원명으로 사원코드 조회
                    if (shippingData.employeeName) {
                        const employeeInfo = await this.getEmployeeInfoByName(shippingData.employeeName);
                        if (employeeInfo) {
                            shippingData.employeeCode = employeeInfo.employeeCode;
                        }
                    }

                    // 단가 기반 가격 계산
                    if (shippingData.productName && shippingData.shippingOrderQuantity > 0) {
                        const productInfo = await this.getProductInfoByName(shippingData.productName);
                        if (productInfo && productInfo.productPriceSale) {
                            const unitPrice = this.safeParseInt(productInfo.productPriceSale, 0);
                            shippingData.unitPrice = unitPrice;
                            shippingData.supplyPrice = unitPrice * shippingData.shippingOrderQuantity;
                            shippingData.vat = Math.round(shippingData.supplyPrice * 0.1); // 부가세 10%
                            shippingData.total = shippingData.supplyPrice + shippingData.vat;
                        }
                    }
                    
                    // 데이터 검증
                    this.validateShippingData(shippingData, i);

                    // 출하 데이터 생성
                    const shipping = this.shippingRepository.create({
                        shippingCode: shippingData.shippingCode,
                        shippingDate: shippingData.shippingDate,
                        orderCode: undefined, // 수주없이 등록
                        productCode: shippingData.productCode,
                        productName: shippingData.productName,
                        unit: shippingData.unit,
                        inventoryQuantity: shippingData.inventoryQuantity || 0,
                        shippingOrderQuantity: shippingData.shippingOrderQuantity,
                        shippingStatus: shippingData.shippingStatus || '지시완료',
                        unitPrice: shippingData.unitPrice?.toString() || '0',
                        supplyPrice: shippingData.supplyPrice?.toString() || '0',
                        vat: shippingData.vat?.toString() || '0',
                        total: shippingData.total?.toString() || '0',
                        employeeCode: shippingData.employeeCode,
                        employeeName: shippingData.employeeName,
                        remark: shippingData.remark,
                        createdBy: username
                    });
                    
                    const savedShipping = await this.shippingRepository.save(shipping);

                    results.success++;
                    results.data.push(savedShipping);

                } catch (error) {
                    results.failed++;
                    const errorMsg = `${i}행 처리 실패: ${error.message}`;
                    results.errors.push(errorMsg);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '출하관리 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `출하관리 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });

            return results;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '출하관리 업로드',
                action: 'UPLOAD_FAIL',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `출하관리 업로드 실패: ${error.message}`,
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

    private parseRowData(row: ExcelJS.Row, rowIndex: number): any {
        const values = row.values as any[];
        
        // 엑셀 컬럼 순서에 맞게 데이터 추출 (출하관리 양식)
        const shippingData = {
            shippingDate: this.getDateValue(values[1]), // A열: 출하일자
            productName: this.getStringValue(values[2]), // B열: 품목명
            shippingOrderQuantity: this.getNumberValue(values[3]), // C열: 출하 지시 수량
            employeeName: this.getStringValue(values[4]), // D열: 사원명
            remark: this.getStringValue(values[5]), // E열: 비고
        };

        return shippingData;
    }

    private async getProductInfoByName(productName: string): Promise<ProductInfo | null> {
        try {
            const product = await this.productRepository.findOne({
                where: { productName: productName.trim() }
            });
            
            return product;
            
        } catch (error) {
            return null;
        }
    }

    private async getEmployeeInfoByName(employeeName: string): Promise<Employee | null> {
        try {
            const employee = await this.employeeRepository.findOne({
                where: { employeeName: employeeName.trim() }
            });
            
            return employee;
            
        } catch (error) {
            return null;
        }
    }

    private validateShippingData(data: any, rowIndex: number): void {
        const { shippingDate, productName, shippingOrderQuantity, employeeName, remark } = data;
        
        // 필수 필드 검증
        if (!shippingDate) {
            throw new BadRequestException(`${rowIndex}행: 출하일자가 비어있습니다.`);
        }
        if (!productName || productName.trim() === '') {
            throw new BadRequestException(`${rowIndex}행: 품목명이 비어있습니다.`);
        }
        if (shippingOrderQuantity === undefined || shippingOrderQuantity === null || shippingOrderQuantity <= 0) {
            throw new BadRequestException(`${rowIndex}행: 출하 지시 수량이 올바르지 않습니다.`);
        }
        
        // 선택적 필드들은 기본값 설정
        if (!employeeName || employeeName.trim() === '') {
            data.employeeName = '';
        }
        if (!remark || remark.trim() === '') {
            data.remark = '';
        }
    }

    /**
     * 안전한 parseInt 함수 (NaN 방지)
     */
    private safeParseInt(value: any, defaultValue: number = 0): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}