import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeeBank } from "../entities/employee-bank.entity";
import { CreateEmployeeBankDto } from "../dto/employee-bank-create.dto";
import { BadRequestException } from "@nestjs/common";

export class EmployeeBankCreateService {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly employeeBankRepository: Repository<EmployeeBank>,
  ) {}

  async createEmployeeBank(
    createEmployeeBankDto: CreateEmployeeBankDto,
    createdBy: string,
  ): Promise<EmployeeBank> {
    const { employeeCode, accountNumber } = createEmployeeBankDto;

    // ✅ 중복 체크
    const exists = await this.employeeBankRepository.findOne({
      where: { employeeCode, accountNumber },
    });

    if (exists) {
      throw new BadRequestException('해당 직원에 이미 동일한 계좌번호가 등록되어 있습니다.');
    }

    const employeeBankEntity = this.createEmployeeBankEntity(createEmployeeBankDto, createdBy);
    return this.employeeBankRepository.save(employeeBankEntity);
  }

  private createEmployeeBankEntity(dto: CreateEmployeeBankDto, createdBy: string): EmployeeBank {
    return this.employeeBankRepository.create({
      ...dto,
      createdBy,
    });
  }
}