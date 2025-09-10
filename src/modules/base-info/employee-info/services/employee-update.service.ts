import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto } from '../dto/employee-create.dto';

@Injectable()
export class EmployeeUpdateService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) {}

    async updateEmployee(
        id: number,
        createEmployeeDto: CreateEmployeeDto,
        updatedBy: string,
    ): Promise<Employee> {
        const existingEmployee = await this.findEmployeeById(id);

        const updatedEmployee = {
            ...existingEmployee,
            ...createEmployeeDto,
            updatedBy,
            updatedAt: new Date(),
        };
        
        return this.employeeRepository.save(updatedEmployee);
    }

    private async findEmployeeById(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({
            where: { id },
        });

        if (!employee) {
            throw new NotFoundException('직원 정보를 찾을 수 없습니다.');
        }

        return employee;
    }

}