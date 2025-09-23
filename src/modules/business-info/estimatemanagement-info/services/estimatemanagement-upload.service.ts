import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { CustomerInfo } from '../../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { Employee } from '../../../base-info/employee-info/entities/employee.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class EstimateManagementUploadService {
    constructor(
        @InjectRepository(EstimateManagement)
        private readonly estimateRepository: Repository<EstimateManagement>,
        @InjectRepository(CustomerInfo)
        private readonly customerInfoRepository: Repository<CustomerInfo>,
        @InjectRepository(ProductInfo)
        private readonly productInfoRepository: Repository<ProductInfo>,
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
        private readonly logService: logService,
    ) {}

    async uploadEstimateManagement(file: Express.Multer.File, username: string) {
        try {

            // 엑셀 파일 읽기
            const workbook = new ExcelJS.Workbook();
<<<<<<< HEAD
            await workbook.xlsx.load(file.buffer);
=======
            await workbook.xlsx.load(file.buffer as any);
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
            
            // 시트 찾기 (여러 시트명 시도)
            let worksheet = workbook.getWorksheet('견적관리양식');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('견적관리');
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
                throw new BadRequestException(`견적관리 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
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
                    const estimateData = this.parseRowData(row, i);
                    
                    // 견적코드 자동 생성
                    estimateData.estimateCode = await this.generateEstimateCode();
                    
                    // 고객명으로 고객코드 조회
                    if (estimateData.customerName) {
                        estimateData.customerCode = await this.getCustomerCodeByName(estimateData.customerName);
                    }
                    
                    // 프로젝트명으로 프로젝트코드 조회 또는 자동 생성
                    if (estimateData.projectName) {
                        estimateData.projectCode = await this.getOrGenerateProjectCode(estimateData.projectName);
                    }
                    
                    // 제품명으로 제품코드 조회
                    if (estimateData.productName) {
                        estimateData.productCode = await this.getProductCodeByName(estimateData.productName);
                    }
                    
                    // 담당자명으로 사원코드 조회
                    if (estimateData.employeeName) {
                        estimateData.employeeCode = await this.getEmployeeCodeByName(estimateData.employeeName);
                    }
                    
                    // 데이터 검증
                    this.validateEstimateData(estimateData, i);
                    
                    // 견적 데이터 생성
                    const estimate = this.estimateRepository.create(estimateData);
                    const savedEstimate = await this.estimateRepository.save(estimate);
                    
                    results.success++;
                    results.data.push(savedEstimate);
                    
                    
                } catch (error) {
                    results.failed++;
                    const errorMsg = `${i}행 처리 실패: ${error.message}`;
                    results.errors.push(errorMsg);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '견적관리 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `견적관리 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });


            return results;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '견적관리 업로드',
                action: 'UPLOAD_FAIL',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `견적관리 업로드 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }

    private isEmptyRow(row: ExcelJS.Row): boolean {
        const values = row.values as any[];
        return !values || values.length <= 1 || values.slice(1).every(val => val === undefined || val === null || val === '');
    }

    private parseRowData(row: ExcelJS.Row, rowIndex: number): any {
        const values = row.values as any[];
        
        // 엑셀 컬럼 순서에 맞게 데이터 추출
        const estimateData = {
            estimateName: this.getStringValue(values[1]), // A열: 견적명
            estimateDate: this.getDateValue(values[2]), // B열: 견적일자
            estimateVersion: this.getNumberValue(values[3]), // C열: 견적버전
            customerName: this.getStringValue(values[4]), // D열: 고객명
            projectName: this.getStringValue(values[5]), // E열: 프로젝트명
            productName: this.getStringValue(values[6]), // F열: 제품명
            productQuantity: this.getNumberValue(values[7]), // G열: 제품수량
            estimateStatus: this.getStringValue(values[8]), // H열: 견적상태
            estimatePrice: this.getNumberValue(values[9]), // I열: 견적가격
            employeeName: this.getStringValue(values[10]), // J열: 담당자명
            estimateRemark: this.getStringValue(values[11]), // K열: 견적비고
            termsOfPayment: this.getStringValue(values[12]), // L열: 결제조건
        };

        return estimateData;
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

    private async generateEstimateCode(): Promise<string> {
        // 현재 날짜를 기반으로 견적코드 생성 (YYYYMMDD + 4자리 순번)
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 오늘 날짜로 생성된 견적코드 개수 조회
        const count = await this.estimateRepository
            .createQueryBuilder('estimate')
            .where('estimate.estimateCode LIKE :pattern', { pattern: `EST${dateStr}%` })
            .getCount();
        
        // 순번 생성 (4자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `EST${dateStr}${sequence}`;
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
            // 기존 견적데이터에서 같은 프로젝트명으로 프로젝트코드 조회
            const existingEstimate = await this.estimateRepository.findOne({
                where: { projectName: projectName.trim() }
            });
            
            if (existingEstimate) {
                return existingEstimate.projectCode;
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
        const result = await this.estimateRepository
            .createQueryBuilder('estimate')
            .select('estimate.projectCode')
            .where('estimate.projectCode IS NOT NULL')
            .andWhere('estimate.projectCode LIKE :pattern', { pattern: 'PROJ%' })
            .orderBy('estimate.projectCode', 'DESC')
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

    private async getEmployeeCodeByName(employeeName: string): Promise<string> {
        try {
            const employee = await this.employeeRepository.findOne({
                where: { employeeName: employeeName.trim() }
            });
            
            if (!employee) {
                throw new BadRequestException(`사원 정보를 찾을 수 없습니다: ${employeeName}`);
            }
            
            return employee.employeeCode;
            
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`사원 정보 조회 중 오류가 발생했습니다: ${employeeName}`);
        }
    }

    private validateHeaders(worksheet: ExcelJS.Worksheet): void {
        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values as any[];
        
        
        // 예상되는 헤더들
        const expectedHeaders = [
            '견적명', '견적일자', '견적버전', '고객명', '프로젝트명', 
            '제품명', '제품수량', '견적상태', '견적가격', '담당자명', 
            '견적비고', '결제조건'
        ];
        
        // 첫 번째 셀이 비어있으면 헤더가 없다고 판단
        if (!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
        
        // 헤더가 예상과 다르면 경고만 출력 (엄격하지 않게)
        const actualHeaders = headers.slice(1).map(h => String(h).trim());
    }

    private validateEstimateData(data: any, rowIndex: number): void {
        const errors: string[] = [];

        // 필수 필드 검증 (견적코드는 자동 생성되므로 제외)
        if (!data.estimateName || data.estimateName.trim() === '') {
            errors.push('견적명은 필수입니다');
        }

        if (!data.customerName || data.customerName.trim() === '') {
            errors.push('고객명은 필수입니다');
        }

        if (!data.projectName || data.projectName.trim() === '') {
            errors.push('프로젝트명은 필수입니다');
        }

        if (!data.productName || data.productName.trim() === '') {
            errors.push('제품명은 필수입니다');
        }

        if (data.productQuantity <= 0) {
            errors.push('제품수량은 0보다 커야 합니다');
        }

        if (!data.estimateStatus || data.estimateStatus.trim() === '') {
            errors.push('견적상태는 필수입니다');
        }

        if (data.estimatePrice <= 0) {
            errors.push('견적가격은 0보다 커야 합니다');
        }

        if (!data.employeeName || data.employeeName.trim() === '') {
            errors.push('담당자명은 필수입니다');
        }

        // 날짜 검증
        if (!data.estimateDate || isNaN(data.estimateDate.getTime())) {
            errors.push('견적일자는 유효한 날짜여야 합니다');
        }

        // 버전 검증
        if (data.estimateVersion <= 0) {
            errors.push('견적버전은 1 이상이어야 합니다');
        }

        if (errors.length > 0) {
            throw new BadRequestException(`${rowIndex}행: ${errors.join(', ')}`);
        }
    }
}
