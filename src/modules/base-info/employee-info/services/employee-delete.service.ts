import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeDeleteService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) {}

    async hardDeleteEmployee(id: number): Promise<void> {
        const existingEmployee = await this.findEmployeeById(id);

        await this.employeeRepository.remove(existingEmployee);
    }

    private async findEmployeeById(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({
            where: { id },
        })

        if (!employee) {
            throw new NotFoundException('직원 정보를 찾을 수 없습니다.');
        }

        return employee;
    }
}