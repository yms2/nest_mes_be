import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Claim } from '../entities/claim.entity';
import { EstimateManagement } from '../../../business-info/estimatemanagement-info/entities/estimatemanagement.entity';
import { CustomerInfo } from '../../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { Employee } from '../../../base-info/employee-info/entities/employee.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ClaimUploadService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
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

    async uploadClaims(file: Express.Multer.File, username: string) {
        try {
            // 엑셀 파일 읽기
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(Buffer.from(file.buffer));
            
            // 시트 찾기 (다운로드 템플릿과 동일한 시트명 우선)
            let worksheet = workbook.getWorksheet('AS 클레임 등록 템플릿');
            if (!worksheet) {
                worksheet = workbook.getWorksheet('AS 클레임 관리');
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
                throw new BadRequestException(`클레임 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
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
                    const claimData = this.parseRowData(row, i);
                    
                    // 클레임코드 자동 생성
                    claimData.claimCode = await this.generateClaimCode();
                    
                    // 거래처명으로 거래처코드 조회
                    if (claimData.customerName) {
                        claimData.customerCode = await this.getCustomerCodeByName(claimData.customerName);
                    }
                    
                    // 프로젝트명으로 프로젝트코드 조회 (견적 데이터에서)
                    if (claimData.projectName) {
                        claimData.projectCode = await this.getProjectCodeFromEstimate(claimData.projectName);
                    }
                    
                    // 품목명으로 품목코드 조회
                    if (claimData.productName) {
                        claimData.productCode = await this.getProductCodeByName(claimData.productName);
                    }
                    
                    // 담당자명으로 사원코드 조회
                    if (claimData.employeeName) {
                        claimData.employeeCode = await this.getEmployeeCodeByName(claimData.employeeName);
                    }
                    
                    // 데이터 검증
                    this.validateClaimData(claimData, i);
                    
                    // 클레임 데이터 생성 (등록자 정보 추가)
                    const claim = this.claimRepository.create({
                        ...claimData,
                        createdBy: username
                    });
                    const savedClaim = await this.claimRepository.save(claim);
                    
                    results.success++;
                    results.data.push(savedClaim);
                    
                } catch (error) {
                    results.failed++;
                    const errorMsg = `${i}행 처리 실패: ${error.message}`;
                    results.errors.push(errorMsg);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '클레임 업로드',
                action: 'UPLOAD_SUCCESS',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `클레임 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
            });

            return results;

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '클레임 업로드',
                action: 'UPLOAD_FAIL',
                username,
                targetId: '',
                targetName: file.originalname,
                details: `클레임 업로드 실패: ${error.message}`,
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
        
        // 템플릿과 동일한 컬럼 순서로 데이터 추출 (13개 컬럼)
        const claimData = {
            claimDate: this.getDateValue(values[1]), // A열: 클레임일자*
            customerName: this.getStringValue(values[2]), // B열: 거래처명*
            projectName: this.getStringValue(values[3]), // C열: 프로젝트명
            productName: this.getStringValue(values[4]), // D열: 품목명*
            claimQuantity: this.getNumberValue(values[5]), // E열: 클레임수량*
            claimPrice: this.getNumberValue(values[6]), // F열: 클레임단가*
            claimReason: this.getStringValue(values[7]), // G열: 클레임사유*
            claimStatus: this.getStringValue(values[8]), // H열: 클레임상태
            employeeName: this.getStringValue(values[9]), // I열: 담당자명*
            expectedCompletionDate: this.getDateValue(values[10]), // J열: 예상완료일
            completionDate: this.getDateValue(values[11]), // K열: 처리완료일
            resolution: this.getStringValue(values[12]), // L열: 처리결과
            remark: this.getStringValue(values[13]), // M열: 비고
        };

        return claimData;
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

    private async generateClaimCode(): Promise<string> {
        // 현재 날짜를 기반으로 클레임코드 생성 (YYYYMMDD + 4자리 순번)
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 오늘 날짜로 생성된 클레임코드 개수 조회
        const count = await this.claimRepository
            .createQueryBuilder('claim')
            .where('claim.claimCode LIKE :pattern', { pattern: `CLM${dateStr}%` })
            .getCount();
        
        // 순번 생성 (4자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `CLM${dateStr}${sequence}`;
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

    private async getProjectCodeFromEstimate(projectName: string): Promise<string> {
        try {
            // 기존 견적데이터에서 같은 프로젝트명으로 프로젝트코드 조회
            const existingEstimate = await this.estimateRepository.findOne({
                where: { projectName: projectName.trim() }
            });
            
            if (existingEstimate) {
                return existingEstimate.projectCode;
            }
            
            // 기존 프로젝트가 없으면 빈 문자열 반환
            return '';
            
        } catch (error) {
            throw new BadRequestException(`프로젝트 정보 처리 중 오류가 발생했습니다: ${projectName}`);
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
        
        // 다운로드 템플릿과 동일한 헤더들 (* 표시 포함)
        const expectedHeaders = [
            '클레임일자*', '거래처명*', '프로젝트명', '품목명*', 
            '클레임수량*', '클레임단가*', '클레임사유*', '클레임상태', 
            '담당자명*', '예상완료일', '처리완료일', '처리결과', '비고'
        ];
        
        // 첫 번째 셀이 비어있으면 헤더가 없다고 판단
        if (!headers || headers.length <= 1 || !headers[1]) {
            throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
        }
        
        // 헤더가 예상과 다르면 경고만 출력 (엄격하지 않게)
        const actualHeaders = headers.slice(1).map(h => String(h).trim());
    }

    private validateClaimData(data: any, rowIndex: number): void {
        const errors: string[] = [];

        // 필수 필드 검증 (클레임코드는 자동 생성되므로 제외)
        if (!data.claimDate || isNaN(data.claimDate.getTime())) {
            errors.push('클레임일자는 필수입니다');
        }

        if (!data.customerName || data.customerName.trim() === '') {
            errors.push('거래처명은 필수입니다');
        }

        if (!data.productName || data.productName.trim() === '') {
            errors.push('품목명은 필수입니다');
        }

        if (data.claimQuantity <= 0) {
            errors.push('클레임수량은 0보다 커야 합니다');
        }

        if (data.claimPrice <= 0) {
            errors.push('클레임단가는 0보다 커야 합니다');
        }

        if (!data.claimReason || data.claimReason.trim() === '') {
            errors.push('클레임사유는 필수입니다');
        }

        if (!data.employeeName || data.employeeName.trim() === '') {
            errors.push('담당자명은 필수입니다');
        }

        if (errors.length > 0) {
            throw new BadRequestException(`${rowIndex}행: ${errors.join(', ')}`);
        }
    }
}
