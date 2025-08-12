import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto } from '../dto/employee-create.dto';

@Injectable()
export class EmployeeCreateService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) {}

    async createEmployee(
        createEmployeeDto: CreateEmployeeDto,
        createdBy: string,
    ): Promise<Employee> {
        const newEmployeeCode = await this.generateEmployeeCode();
        const employeeEntity = this.createEmployeeEntity(
            createEmployeeDto,
            newEmployeeCode,
            createdBy,
        );
        return this.employeeRepository.save(employeeEntity);
    }

    private async generateEmployeeCode(): Promise<string> {
        const [lastEmployee] = await this.employeeRepository.find({
            order: { employeeCode: 'DESC' },
            take: 1,
        });

        const nextNumber = lastEmployee?.employeeCode
            ? parseInt(lastEmployee.employeeCode.slice(3), 10) + 1
            : 1;

        return `EMP${nextNumber.toString().padStart(3, '0')}`;
    }

    private createEmployeeEntity(
        dto: CreateEmployeeDto,
        employeeCode: string,
        createdBy: string,
    ): Employee {
        return this.employeeRepository.create({
            employeeCode,
            ...dto,
            createdBy,
        });
    }
}