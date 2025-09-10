import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeBank } from "../entities/employee-bank.entity";
import { Repository } from "typeorm";
import { CreateEmployeeBankDto } from "../dto/employee-bank-create.dto";

@Injectable()
export class EmployeeBankCreateHandler {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly employeeBankRepository: Repository<EmployeeBank>,
  ) {}

  public async findEmployeeBankById(id: number): Promise<EmployeeBank> {
    const employeeBankInfo = await this.employeeBankRepository.findOne({
      where: { id },
    });

    if (!employeeBankInfo) {
      throw new NotFoundException('직원 계좌 정보를 찾을 수 없습니다.');
    }

    return employeeBankInfo;
  }

  public validateUpdateData(dto: CreateEmployeeBankDto): void {
    if (dto.accountNumber && !/^\d+$/.test(dto.accountNumber)) {
      throw new BadRequestException('계좌번호는 숫자만 포함되어야 합니다.');
    }
  }

  public async validateBusinessBankNumberUniqueness(accountNumber: string): Promise<void> {
    const existingEmployeeInfo = await this.employeeBankRepository.findOne({
      where: { accountNumber },
    });

    if (existingEmployeeInfo) {
      throw new BadRequestException('이미 등록된 계좌입니다.');
    }
  }

}