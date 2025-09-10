import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { EmployeeBank } from "../entities/employee-bank.entity";
import { CreateEmployeeBankDto } from "../dto/employee-bank-create.dto";
import { EmployeeBankCreateHandler } from "../handlers/employee-bank-create.handler";

@Injectable()
export class EmployeeBankUpdateService {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly employeeBankRepository: Repository<EmployeeBank>,
    private readonly employeeBankCreateHandler: EmployeeBankCreateHandler,
  ) {}

  async updateEmployeeBank(
    id: number,
    createEmployeeBankDto: CreateEmployeeBankDto,
    updatedBy: string,
  ): Promise<EmployeeBank> {
    const existingEmployeeBank = await this.employeeBankCreateHandler.findEmployeeBankById(id);

    // 입력 데이터 검증
    this.employeeBankCreateHandler.validateUpdateData(createEmployeeBankDto);

    // 계좌번호 중복 검증 (계좌번호가 변경되는 경우)
    if (
      createEmployeeBankDto.accountNumber &&
      createEmployeeBankDto.accountNumber !== existingEmployeeBank.accountNumber
    ) {
      await this.employeeBankCreateHandler.validateBusinessBankNumberUniqueness(createEmployeeBankDto.accountNumber);
    }

    const updatedEmployeeBankInfo = {
      ...existingEmployeeBank,
      ...createEmployeeBankDto,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.employeeBankRepository.save(updatedEmployeeBankInfo);
  }
}