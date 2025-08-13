import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeExcelRow } from './employee-upload-validation.service';
import { EmployeeCreateService } from '../employee-create.service';

@Injectable()
export class EmployeeUploadProcessingService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
        private readonly employeeCreateService: EmployeeCreateService,
    ) {}

    async processValidatedData(
        rows: EmployeeExcelRow[],
        mode: 'add' | 'overwrite',
        createdBy: string,
    ): Promise<{ totalCount: number; newCount: number; updateCount: number }> {
        let newCount = 0;
        let updateCount = 0;

        for (const row of rows) {
            const employeeName = String(row['사원명'] ?? '').trim();
            const department = String(row['부서명'] ?? '').trim();
            const position = String(row['직급'] ?? '').trim();
            const gender = String(row['성별'] ?? '').trim();
            const domesticForeign = String(row['내/외국인'] ?? '').trim();
            const birthday = String(row['생년월일'] ?? '').trim();
            const employeePhone = String(row['휴대폰'] ?? '').trim();
            const employeeEmail = String(row['이메일'] ?? '').trim();
            const hireDate = String(row['입사일'] ?? '').trim();

            if (mode === 'add') {
                const existingEmployee = await this.employeeRepository.findOne({
                    where: { employeeName },
                });

                if (!existingEmployee) {
                    const createDto = this.convertToCreateDto(row);
                    await this.employeeCreateService.createEmployee(createDto, createdBy);
                    newCount++;
                }
            } else {
                const existingEmployee = await this.employeeRepository.findOne({
                    where: { employeeName },
                });

                if (existingEmployee) {
                    await this.updateEmployee(existingEmployee, row, createdBy);
                    updateCount++;
                } else {
                    const createDto = this.convertToCreateDto(row);
                    await this.employeeCreateService.createEmployee(createDto, createdBy);
                    newCount++;
                }
            }
        }

        return {
            totalCount: rows.length,
            newCount,
            updateCount,
        };
    }



    private async updateEmployee(existingEmployee: Employee, row: EmployeeExcelRow, updatedBy: string): Promise<Employee> {
        existingEmployee.employeeName = String(row['사원명'] ?? '').trim();
        existingEmployee.department = String(row['부서명'] ?? '').trim();
        existingEmployee.position = String(row['직급'] ?? '').trim();
        existingEmployee.gender = String(row['성별'] ?? '').trim();
        existingEmployee.domesticForeign = String(row['내/외국인'] ?? '').trim();
        existingEmployee.birthday = new Date(String(row['생년월일'] ?? '').trim());
        existingEmployee.employeePhone = String(row['휴대폰'] ?? '').trim();
        existingEmployee.employeeEmail = String(row['이메일'] ?? '').trim();
        existingEmployee.hireDate = new Date(String(row['입사일'] ?? '').trim());
        existingEmployee.zipcode = String(row['우편번호'] ?? '').trim();
        existingEmployee.address = String(row['주소'] ?? '').trim();
        existingEmployee.addressDetail = String(row['상세주소'] ?? '').trim();
        existingEmployee.updatedBy = updatedBy;

        return await this.employeeRepository.save(existingEmployee);
    }

    private convertToCreateDto(row: EmployeeExcelRow): any {
        return {
            employeeName: String(row['사원명'] ?? '').trim(),
            department: String(row['부서명'] ?? '').trim(),
            position: String(row['직급'] ?? '').trim(),
            gender: String(row['성별'] ?? '').trim(),
            domesticForeign: String(row['내/외국인'] ?? '').trim(),
            birthday: new Date(String(row['생년월일'] ?? '').trim()),
            employeePhone: String(row['휴대폰'] ?? '').trim(),
            employeeEmail: String(row['이메일'] ?? '').trim(),
            hireDate: new Date(String(row['입사일'] ?? '').trim()),
            resignationDate: null, // 퇴사일은 null로 설정
            zipcode: String(row['우편번호'] ?? '').trim(),
            address: String(row['주소'] ?? '').trim(),
            addressDetail: String(row['상세주소'] ?? '').trim(),
        };
    }
}