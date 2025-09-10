import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { DateFormatter } from 'src/common/utils/date-formatter.util';
import { SearchEmployeeDto } from '../dto/employee-search.dto';

@Injectable()
export class EmployeeReadService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) {}

    async getEmployeeByCode(query: SearchEmployeeDto): Promise<Employee> {
        const { employeeCode } = query;

        const employee = await this.employeeRepository.findOne({
            where: { employeeCode },
        });

        if (!employee) {
            throw new NotFoundException('직원 정보를 찾을 수 없습니다.');
        }

        return DateFormatter.formatBusinessInfoDates(employee);

    }

    async getAllEmployee(
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
        const offset = (page - 1) * limit;

        const [data, total] = await this.employeeRepository.findAndCount({
            order: { employeeName: 'ASC' },
            skip: offset,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
        };
    }
}


