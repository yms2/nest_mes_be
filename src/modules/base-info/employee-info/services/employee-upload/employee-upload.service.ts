import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeUploadValidationService, EmployeeExcelRow } from './employee-upload-validation.service';
import { EmployeeUploadProcessingService } from './employee-upload-processing.service';
import { EmployeeUploadSessionService } from './employee-upload-session.service';

export interface ValidationResponse {
    success: boolean;
    message: string;
    data: {
        validationId: string;
        result: any;
    };
}

export interface UploadResponse {
    success: boolean;
    message: string;
    data?: {
        totalCount: number;
        newCount: number;
        updateCount: number;
        errorCount: number;
    };
}

@Injectable()
export class EmployeeUploadService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
        private readonly validationService: EmployeeUploadValidationService,
        private readonly processingService: EmployeeUploadProcessingService,
        private readonly sessionService: EmployeeUploadSessionService,
    ) {}

    async validateExcel(buffer: Buffer): Promise<ValidationResponse> {
        const rows = this.validationService.parseExcelFile(buffer);
        const existingEmployees = await this.getExistingEmployees();
        const result = this.validationService.validateRows(rows, existingEmployees);
        const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.sessionService.createSession(validationId, rows, result);

        return {
            success: true,
            message: '사원 정보 검증이 완료되었습니다.',
            data: {
                validationId,
                result,
            },
        };
    }

    async processValidatedData(validationId: string, mode: 'add' | 'overwrite'): Promise<UploadResponse> {
        const session = this.sessionService.getSession(validationId);
        if (!session) {
            throw new NotFoundException('검증 세션을 찾을 수 없습니다.');
        }

        const result = await this.processingService.processValidatedData(
            session.rows,
            mode,
            'admin',
        );

        this.sessionService.deleteSession(validationId);

        return {
            success: true,
            message: '사원 정보 업로드가 완료되었습니다.',
        };
    }
    private async getExistingEmployees(): Promise<Map<string, Employee>> {
        const employees = await this.employeeRepository.find({
            select: ['employeeName'],
        });
        const employeeMap = new Map<string, Employee>();
        employees.forEach(employee => {
            employeeMap.set(employee.employeeName, employee);
        });
        return employeeMap;
    }
}
