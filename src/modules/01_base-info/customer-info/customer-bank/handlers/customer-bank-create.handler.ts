import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerBank } from "../entities/customer-bank.entity";
import { Repository } from "typeorm";
import { CreateCustomerBankDto } from "../dto/customer-bank-create.dto";

@Injectable()
export class CustomerBankCreateHandler {
  constructor(
    @InjectRepository(CustomerBank)
    private readonly customerBankRepository: Repository<CustomerBank>,
  ) {}

  public async findCustomerBankById(id: number): Promise<CustomerBank> {
    const customerBankInfo = await this.customerBankRepository.findOne({
      where: { id },
    });

    if (!customerBankInfo) {
      throw new NotFoundException('거래처 계좌 정보를 찾을 수 없습니다.');
    }

    return customerBankInfo;
  }

  public validateUpdateData(dto: CreateCustomerBankDto): void {
    if (dto.accountNumber && !/^\d+$/.test(dto.accountNumber)) {
      throw new BadRequestException('계좌번호는 숫자만 포함되어야 합니다.');
    }
  }

  public async validateBusinessBankNumberUniqueness(accountNumber: string): Promise<void> {
    const existingBusinessInfo = await this.customerBankRepository.findOne({
      where: { accountNumber },
    });

    if (existingBusinessInfo) {
      throw new BadRequestException('이미 등록된 계좌입니다.');
    }
  }

}