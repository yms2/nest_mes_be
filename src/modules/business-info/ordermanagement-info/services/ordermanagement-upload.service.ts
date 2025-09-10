import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { CustomerInfo } from '../../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class OrderManagementUploadService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        @InjectRepository(CustomerInfo)
        private readonly customerInfoRepository: Repository<CustomerInfo>,
        @InjectRepository(ProductInfo)
        private readonly productInfoRepository: Repository<ProductInfo>,
        private readonly logService: logService,
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
            '수주일', '거래처명', '프로젝트명', '품목명', '수주구분', 
            '수량', '단가', '공급가액', '부가세', '합계', 
            '납품예정일', '참조견적', '비고'
        ];
        
        // 첫 번째 셀이 비어있으면 헤더가 없다고 판단
        if (!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
        
        // 헤더가 예상과 다르면 경고만 출력 (엄격하지 않게)
        const actualHeaders = headers.slice(1).map(h => String(h).trim());
    }

    async uploadOrderManagement(file: Express.Multer.File, username: string) {
        try {

            // 엑셀 파일 읽기
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);

            // 시트 찾기 (여러 시트명 시도)
            let worksheet = workbook.getWorksheet('수주관리양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('수주관리');
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
                throw new BadRequestException(`수주관리 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
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
                    const orderData = this.parseRowData(row, i);

                    // 수주코드 자동 생성
                    orderData.orderCode = await this.generateOrderCode();

                    // 고객명으로 고객코드 조회
                    if (orderData.customerName) {
                        orderData.customerCode = await this.getCustomerCodeByName(orderData.customerName);
                    }

                    // 프로젝트명으로 프로젝트코드 조회 또는 자동 생성
                    if (orderData.projectName) {
                        orderData.projectCode = await this.getOrGenerateProjectCode(orderData.projectName);
                    }

                    // 제품명으로 제품코드 조회
                    if (orderData.productName) {
                        orderData.productCode = await this.getProductCodeByName(orderData.productName);
                    }
                    
                    // 데이터 검증
                    this.validateOrderData(orderData, i);

                    // 수주 데이터 생성 (엔티티 필드에 맞게 매핑)
                    const ordermanagement = this.orderManagementRepository.create({
                        orderCode: orderData.orderCode,
                        orderDate: orderData.orderDate,
                        customerCode: orderData.customerCode,
                        customerName: orderData.customerName,
                        projectCode: orderData.projectCode,
                        projectName: orderData.projectName,
                        productCode: orderData.productCode,
                        productName: orderData.productName,
                        orderType: orderData.orderType,
                        quantity: orderData.quantity,
                        unitPrice: orderData.unitPrice.toString(),
                        supplyPrice: orderData.supplyPrice.toString(),
                        vat: orderData.vat.toString(),
                        total: orderData.total.toString(),
                        deliveryDate: orderData.deliveryDate,
                        estimateCode: orderData.estimateCode,
                        remark: orderData.remark
                    });
                    const savedOrderManagement = await this.orderManagementRepository.save(ordermanagement);

                    results.success++;
                    results.data.push(savedOrderManagement);

                } catch (error) {
                    results.failed++;
                    const errorMsg = `${i}행 처리 실패: ${error.message}`;
                    results.errors.push(errorMsg);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주관리 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `수주관리 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });

            return results;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '수주관리 업로드',
                action: 'UPLOAD_FAIL',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `수주관리 업로드 실패: ${error.message}`,
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

    private async generateOrderCode(): Promise<string> {
        // 현재 날짜를 기반으로 수주코드 생성 (YYYYMMDD + 4자리 순번)
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 오늘 날짜로 생성된 수주코드 개수 조회
        const count = await this.orderManagementRepository
            .createQueryBuilder('order')
            .where('order.orderCode LIKE :pattern', { pattern: `ORD${dateStr}%` })
            .getCount();
        
        // 순번 생성 (4자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `ORD${dateStr}${sequence}`;
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
        
        // 엑셀 컬럼 순서에 맞게 데이터 추출 (수주관리 양식)
        const orderData = {
            orderDate: this.getDateValue(values[1]), // A열: 수주일
            customerName: this.getStringValue(values[2]), // B열: 거래처명
            projectName: this.getStringValue(values[3]), // C열: 프로젝트명
            productName: this.getStringValue(values[4]), // D열: 품목명
            orderType: this.getStringValue(values[5]), // E열: 수주구분
            quantity: this.getNumberValue(values[6]), // F열: 수량
            unitPrice: this.getNumberValue(values[7]), // G열: 단가
            supplyPrice: this.getNumberValue(values[8]), // H열: 공급가액
            vat: this.getNumberValue(values[9]), // I열: 부가세
            total: this.getNumberValue(values[10]), // J열: 합계
            deliveryDate: this.getDateValue(values[11]), // K열: 납품예정일
            estimateCode: this.getStringValue(values[12]), // L열: 참조견적
            remark: this.getStringValue(values[13]), // M열: 비고
        };

        return orderData;
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

    private async getOrGenerateProjectCode(projectName: string): Promise<string> {
        try {
            // 기존 수주데이터에서 같은 프로젝트명으로 프로젝트코드 조회
            const existingOrder = await this.orderManagementRepository.findOne({
                where: { projectName: projectName.trim() }
            });
            
            if (existingOrder) {
                return existingOrder.projectCode;
            }
            
            // 기존 프로젝트가 없으면 새로운 프로젝트코드 생성
            const newProjectCode = await this.generateProjectCode();
            return newProjectCode;
            
        } catch (error) {
            throw new BadRequestException(`프로젝트 정보 처리 중 오류가 발생했습니다: ${projectName}`);
        }
    }

    private async generateProjectCode(): Promise<string> {
        // 기존 프로젝트 코드 중 가장 큰 번호를 찾기
        const result = await this.orderManagementRepository
            .createQueryBuilder('order')
            .select('order.projectCode')
            .where('order.projectCode IS NOT NULL')
            .andWhere('order.projectCode LIKE :pattern', { pattern: 'PROJ%' })
            .orderBy('order.projectCode', 'DESC')
            .limit(1)
            .getOne();

        let nextNumber = 1;
        if (result && result.projectCode) {
            // PROJ001에서 001 부분을 추출
            const match = result.projectCode.match(/PROJ(\d+)/);
            if (match) {
                const currentNumber = parseInt(match[1], 10);
                nextNumber = currentNumber + 1;
            }
        }

        return `PROJ${nextNumber.toString().padStart(3, '0')}`;
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


    private validateOrderData(data: any, rowIndex: number): void {
        const { orderDate, customerName, projectName, productName, orderType, quantity, unitPrice, supplyPrice, vat, total, deliveryDate, estimateCode, remark } = data;
        
        // 필수 필드 검증
        if (!orderDate) {
            throw new BadRequestException(`${rowIndex}행: 수주일이 비어있습니다.`);
        }
        if (!customerName || customerName.trim() === '') {
            throw new BadRequestException(`${rowIndex}행: 거래처명이 비어있습니다.`);
        }
        if (!projectName || projectName.trim() === '') {
            throw new BadRequestException(`${rowIndex}행: 프로젝트명이 비어있습니다.`);
        }
        if (!productName || productName.trim() === '') {
            throw new BadRequestException(`${rowIndex}행: 품목명이 비어있습니다.`);
        }
        if (!orderType || orderType.trim() === '') {
            throw new BadRequestException(`${rowIndex}행: 수주구분이 비어있습니다.`);
        }
        if (quantity === undefined || quantity === null || quantity <= 0) {
            throw new BadRequestException(`${rowIndex}행: 수량이 올바르지 않습니다.`);
        }
        if (unitPrice === undefined || unitPrice === null || unitPrice < 0) {
            throw new BadRequestException(`${rowIndex}행: 단가가 올바르지 않습니다.`);
        }
        if (supplyPrice === undefined || supplyPrice === null || supplyPrice < 0) {
            throw new BadRequestException(`${rowIndex}행: 공급가액이 올바르지 않습니다.`);
        }
        if (vat === undefined || vat === null || vat < 0) {
            throw new BadRequestException(`${rowIndex}행: 부가세가 올바르지 않습니다.`);
        }
        if (total === undefined || total === null || total < 0) {
            throw new BadRequestException(`${rowIndex}행: 합계가 올바르지 않습니다.`);
        }
        
        // 선택적 필드들은 기본값 설정
        if (!deliveryDate) {
            data.deliveryDate = new Date(); // 기본값: 오늘 날짜
        }
        if (!estimateCode || estimateCode.trim() === '') {
            data.estimateCode = ''; // 빈 문자열로 설정
        }
        if (!remark || remark.trim() === '') {
            data.remark = ''; // 빈 문자열로 설정
        }
    }

}