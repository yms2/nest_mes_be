import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeBank } from '../entities/employee-bank.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeBankDeleteService {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly employeeBankRepository: Repository<EmployeeBank>,
  ) {}

  async hardDeleteEmployeeBank(id: number): Promise<void> {
    // 1. 직원 은행 정보 존재 여부 확인
    const existingEmployeeBank = await this.findEmployeeBankById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.employeeBankRepository.remove(existingEmployeeBank);
  }

  private async findEmployeeBankById(id: number): Promise<EmployeeBank> {
    const employeeBank = await this.employeeBankRepository.findOne({
      where: { id },
    });

    if (!employeeBank) {
      throw new NotAcceptableException('직원 은행 정보를 찾을 수 없습니다.');
    }

    return employeeBank;
  }
}